import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { IPC_CHANNELS } from './ipc/channels';
import { registerWindowHandlers } from './ipc/handlers/window.handlers';
import { registerPreferencesHandlers } from './ipc/handlers/preferences.handlers';

const isDev = process.env['ELECTRON_ENV'] === 'development';
const ANGULAR_DEV_URL = 'http://localhost:4200';

let mainWindow: BrowserWindow | null = null;

function registerIpcHandlers(): void {
  registerWindowHandlers(() => mainWindow);
  registerPreferencesHandlers();

  ipcMain.on(IPC_CHANNELS.SHELL.OPEN_EXTERNAL, (_event, targetUrl: string) => {
    shell.openExternal(targetUrl);
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
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

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
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
