import { BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../channels';

/**
 * Register all window-control IPC handlers.
 *
 * @param getWindow - Accessor that returns the current BrowserWindow (or
 *   `null` when no window exists).  Using an accessor instead of a direct
 *   reference keeps the handler registration independent of window lifecycle.
 */
export function registerWindowHandlers(
  getWindow: () => BrowserWindow | null,
): void {
  ipcMain.on(IPC_CHANNELS.WINDOW.MINIMIZE, () => {
    getWindow()?.minimize();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW.MAXIMIZE, () => {
    const win = getWindow();
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW.CLOSE, () => {
    getWindow()?.close();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW.IS_MAXIMIZED, (): boolean => {
    return getWindow()?.isMaximized() ?? false;
  });
}
