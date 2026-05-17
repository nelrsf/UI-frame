import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { registerWindowHandlers } from './ipc/handlers/window.handlers';
import { registerPreferencesHandlers } from './ipc/handlers/preferences.handlers';
import { registerShellHandlers } from './ipc/handlers/shell.handlers';
import { registerMenuHandlers } from './ipc/handlers/menu.handlers';
import { ThemeInitializer } from './theme/theme-initializer';
import { MenuInitializer } from './menu/menu.initializer';
import { emitShellSignals } from './lifecycle/signals';
import { menuConfig } from './menu/menu.config';

const isDev = process.env['ELECTRON_ENV'] === 'development';
const ANGULAR_DEV_URL = 'http://localhost:4200';

let mainWindow: BrowserWindow | null = null;

function registerIpcHandlers(): void {
  registerWindowHandlers(() => mainWindow);
  registerPreferencesHandlers();
  registerShellHandlers();
  registerMenuHandlers();
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
      sandbox: isDev ? false : true,
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
    if (mainWindow) {
      emitShellSignals(mainWindow);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    const { shell } = require('electron');
    const { ALLOWED_EXTERNAL_PROTOCOLS } = require('./ipc/channels');
    try {
      const parsed = new URL(targetUrl);
      if (ALLOWED_EXTERNAL_PROTOCOLS.includes(parsed.protocol)) {
        shell.openExternal(targetUrl).catch(() => {
        });
      }
    } catch {
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const themeInitializer = new ThemeInitializer();
  const storedTheme = await themeInitializer.initialize();

  registerIpcHandlers();
  createWindow();

  if (mainWindow) {
    const menuInitializer = new MenuInitializer(menuConfig);
    menuInitializer.initialize(mainWindow, storedTheme, isDev);
  }

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
