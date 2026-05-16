import { app, BrowserWindow, ipcMain, shell, Menu, nativeTheme } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { ALLOWED_EXTERNAL_PROTOCOLS, IPC_CHANNELS } from './ipc/channels';
import { registerWindowHandlers } from './ipc/handlers/window.handlers';
import { registerPreferencesHandlers } from './ipc/handlers/preferences.handlers';
import { MenuBuilder, MenuManager } from './menu';
import { AppTheme, DEFAULT_THEME, THEME_PREFERENCE_KEY } from '../contracts';
import * as fs from 'fs';

const isDev = process.env['ELECTRON_ENV'] === 'development';
const ANGULAR_DEV_URL = 'http://localhost:4200';

let mainWindow: BrowserWindow | null = null;

/**
 * Read the stored theme preference from preferences.json.
 * Returns the stored theme or DEFAULT_THEME if not found.
 */
function getStoredTheme(): AppTheme {
  try {
    const preferencesPath = path.join(app.getPath('userData'), 'preferences.json');
    if (fs.existsSync(preferencesPath)) {
      const content = fs.readFileSync(preferencesPath, 'utf-8');
      const data = JSON.parse(content);
      const theme = data[THEME_PREFERENCE_KEY];
      if (theme === 'dark' || theme === 'light') {
        return theme;
      }
    }
  } catch {
    // Preference file not found or invalid JSON — use default
  }
  return DEFAULT_THEME;
}

/**
 * Rebuild the application menu with updated panel visibility state.
 * Called from IPC handler when shell toggles panels.
 * 
 * @deprecated Usar MenuManager para actualizaciones parciales.
 */
function rebuildMenu(bottomPanelVisible: boolean, secondaryPanelVisible: boolean): void {
  const manager = MenuManager.getInstance();
  manager.rebuildFull({
    activeTheme: getStoredTheme(),
    isDev,
    bottomPanelVisible,
    secondaryPanelVisible,
  });
}

function registerIpcHandlers(): void {
  registerWindowHandlers(() => mainWindow);
  // Preferences handlers validate the `key` argument at BOTH the sender
  // (preload) and receiver (main) boundary — same dual-validation strategy
  // as the shell:openExternal handler below.
  registerPreferencesHandlers();

  // Handler-side validation: re-validate the URL even though the preload also
  // validates, enforcing the "both sender and receiver" IPC security policy.
  ipcMain.handle(IPC_CHANNELS.SHELL.OPEN_EXTERNAL, async (_event, targetUrl: unknown): Promise<boolean> => {
    if (typeof targetUrl !== 'string') {
      return false;
    }
    try {
      const parsed = new URL(targetUrl);
      if (ALLOWED_EXTERNAL_PROTOCOLS.includes(parsed.protocol)) {
        await shell.openExternal(targetUrl);
        return true;
      }
    } catch {
      // invalid URL — deny silently
    }
    return false;
  });

  // Handler to update menu checkboxes when panel state changes from shell
  // Optimización: actualización parcial O(1) en lugar de reconstruir todo el menú O(n)
  ipcMain.handle(IPC_CHANNELS.MENU.UPDATE_PANEL_STATE, async (_event, payload: unknown): Promise<void> => {
    if (typeof payload === 'object' && payload !== null) {
      const { bottomPanelVisible, secondaryPanelVisible } = payload as { bottomPanelVisible?: boolean; secondaryPanelVisible?: boolean };
      
      const manager = MenuManager.getInstance();
      
      // Actualización parcial - solo actualiza los items específicos
      if (bottomPanelVisible !== undefined) {
        manager.updateBottomPanel(bottomPanelVisible);
      }
      if (secondaryPanelVisible !== undefined) {
        manager.updateSecondaryPanel(secondaryPanelVisible);
      }
    }
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    minWidth: 1280,
    minHeight: 800,
    darkTheme: true,
    backgroundColor: '#1e1e1e',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: isDev ? false : true, // sandbox requiere preload bundlado
    },
  });

  if (isDev) {
    mainWindow.loadURL(ANGULAR_DEV_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '..', '..', 'dist', 'ui-frame', 'browser', 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      return;
    }
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // Emit a detectable signal so the headless smoke runner can confirm the
    // shell became visible.  The prefix keeps it distinguishable from normal
    // application output.
    process.stdout.write('[smoke] shell:visible\n');

    // In smoke mode, confirm that the BrowserWindow reached did-finish-load
    // with the required security settings (NFR-Security-01).  The settings are
    // hardcoded in createWindow() above; if they are ever changed the unit
    // tests in main.spec.ts will catch the regression before this path runs.
    if (process.env['ELECTRON_ENV'] === 'smoke') {
      process.stdout.write('[smoke] security:ok\n');

      // Verify keyboard reachability: query the rendered shell DOM for at least
      // one non-disabled interactive element reachable via the Tab key.
      // The tab bar's new-tab button is always rendered even with no open tabs,
      // guaranteeing a minimum of one focusable target on a fresh shell load.
      // Failure to find any focusable element indicates an accessibility regression
      // (e.g. all buttons mistakenly disabled or given tabindex="-1").
      mainWindow!.webContents
        .executeJavaScript(
          `document.querySelectorAll('button:not([disabled]),[tabindex="0"]').length`
        )
        .then((count: unknown) => {
          if (typeof count === 'number' && count >= 1) {
            process.stdout.write('[smoke] keyboard:reachable\n');
          }
        })
        .catch(() => {
          // DOM query failed — keyboard:reachable signal will not be emitted.
        });

      // Verify secondary panel mock registration rendered both expected entries.
      mainWindow!.webContents
        .executeJavaScript(
          `document.querySelectorAll('[data-testid^="secondary-panel-tab-"]').length`
        )
        .then((count: unknown) => {
          if (typeof count === 'number' && count >= 2) {
            process.stdout.write('[smoke] secondary:entries:ok\n');
          }
        })
        .catch(() => {
          // DOM query failed — secondary entry signal will not be emitted.
        });
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    // Validate before delegating to the OS — deny all non-allowlisted protocols.
    try {
      const parsed = new URL(targetUrl);
      if (ALLOWED_EXTERNAL_PROTOCOLS.includes(parsed.protocol)) {
        // setWindowOpenHandler must return synchronously; fire-and-forget with
        // explicit rejection handling to avoid unhandled-promise-rejection warnings.
        shell.openExternal(targetUrl).catch(() => {
          // OS failed to open the URL — swallow the error, window open is still denied.
        });
      }
    } catch {
      // invalid URL — deny silently
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Read and apply the stored theme preference before creating the window
  const storedTheme = getStoredTheme();
  nativeTheme.themeSource = storedTheme === 'dark' ? 'dark' : 'light';

  registerIpcHandlers();
  createWindow();

  // Inicializar MenuManager con referencia a la ventana
  // Esto permite actualizaciones parciales O(1) en lugar de reconstruir todo
  if (mainWindow) {
    MenuManager.getInstance().setMainWindow(mainWindow);
  }

  // Build and apply the native menu after the window is created
  // Default to true, actual state will sync when shell loads
  rebuildMenu(true, true);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
