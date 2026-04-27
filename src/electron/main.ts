import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { ALLOWED_EXTERNAL_PROTOCOLS, IPC_CHANNELS } from './ipc/channels';
import { registerWindowHandlers } from './ipc/handlers/window.handlers';
import { registerPreferencesHandlers } from './ipc/handlers/preferences.handlers';

const isDev = process.env['ELECTRON_ENV'] === 'development';
const ANGULAR_DEV_URL = 'http://localhost:4200';

let mainWindow: BrowserWindow | null = null;

function registerIpcHandlers(): void {
  registerWindowHandlers(() => mainWindow);
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
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
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

  mainWindow.webContents.on('did-finish-load', () => {
    // Emit a detectable signal so the headless smoke runner can confirm the
    // shell became visible.  The prefix keeps it distinguishable from normal
    // application output.
    process.stdout.write('[smoke] shell:visible\n');
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
  registerIpcHandlers();
  createWindow();

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
