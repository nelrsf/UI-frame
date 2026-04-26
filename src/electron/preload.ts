import { contextBridge, ipcRenderer } from 'electron';
import { ALLOWED_EXTERNAL_PROTOCOLS, IPC_CHANNELS } from './ipc/channels';

type PlatformName = 'win32' | 'darwin' | 'linux';

/** Typed contract for the API exposed to the renderer process. */
export interface ElectronAPI {
  /** @deprecated Use `system.getPlatform()` instead. Kept for backwards compatibility. */
  platform: string;
  window: {
    minimize(): void;
    maximize(): void;
    close(): void;
    isMaximized(): Promise<boolean>;
  };
  system: {
    getPlatform(): Promise<PlatformName>;
    openExternal(url: string): Promise<boolean>;
  };
  preferences: {
    get<T>(key: string, defaultValue: T): Promise<T>;
    set<T>(key: string, value: T): Promise<void>;
  };
}

const api: ElectronAPI = {
  // Kept for backwards compatibility; prefer system.getPlatform().
  platform: process.platform,

  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW.CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW.IS_MAXIMIZED),
  },

  system: {
    getPlatform: (): Promise<PlatformName> =>
      Promise.resolve(process.platform as PlatformName),

    openExternal: (url: string): Promise<boolean> => {
      // Sender-side validation: deny non-allowlisted protocols before the IPC
      // message reaches the main process (least-privilege, defence-in-depth).
      try {
        const parsed = new URL(url);
        if (ALLOWED_EXTERNAL_PROTOCOLS.includes(parsed.protocol)) {
          return ipcRenderer.invoke(IPC_CHANNELS.SHELL.OPEN_EXTERNAL, url);
        }
      } catch {
        // ignore invalid URLs
      }
      return Promise.resolve(false);
    },
  },

  preferences: {
    get: <T>(key: string, defaultValue: T): Promise<T> =>
      ipcRenderer.invoke(IPC_CHANNELS.PREFERENCES.GET, key, defaultValue),

    set: <T>(key: string, value: T): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.PREFERENCES.SET, key, value),
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
