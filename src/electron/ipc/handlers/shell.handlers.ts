import { ipcMain, shell } from 'electron';
import { ALLOWED_EXTERNAL_PROTOCOLS, IPC_CHANNELS } from '../channels';

export function registerShellHandlers(): void {
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