import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { PreferenceStore } from '../../preferences/preference-store';
import { IPC_CHANNELS } from '../channels';

const preferenceStore = PreferenceStore.getInstance();

/**
 * Register all preferences IPC handlers.
 *
 * Validation is applied at BOTH the sender (preload) and receiver (main)
 * boundary per the least-privilege security policy.  Handlers validate that
 * the `key` argument is a non-empty string before reading or writing,
 * returning the `defaultValue` on any validation or I/O failure so the
 * renderer always receives a deterministic result.
 */
export function registerPreferencesHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.PREFERENCES.GET,
    async (_event: IpcMainInvokeEvent, key: unknown, defaultValue: unknown): Promise<unknown> => {
      if (typeof key !== 'string' || key.trim() === '') {
        return defaultValue;
      }
      try {
        const value = await preferenceStore.read(key);
        return value !== undefined ? value : defaultValue;
      } catch {
        return defaultValue;
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.PREFERENCES.SET,
    async (_event: IpcMainInvokeEvent, key: unknown, value: unknown): Promise<void> => {
      if (typeof key !== 'string' || key.trim() === '') {
        return;
      }
      try {
        await preferenceStore.write(key, value);
      } catch {
        // Swallow write errors — renderer must not crash on persistence failure.
      }
    },
  );
}
