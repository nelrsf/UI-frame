import { contextBridge, ipcRenderer } from 'electron';

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

const ALLOWED_PROTOCOLS = ['https:', 'http:'];

const api: ElectronAPI = {
  // Kept for backwards compatibility; prefer system.getPlatform().
  platform: process.platform,

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  system: {
    getPlatform: (): Promise<PlatformName> =>
      Promise.resolve(process.platform as PlatformName),

    openExternal: (url: string): Promise<boolean> => {
      try {
        const parsed = new URL(url);
        if (ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
          ipcRenderer.send('shell:openExternal', url);
          return Promise.resolve(true);
        }
      } catch {
        // ignore invalid URLs
      }
      return Promise.resolve(false);
    },
  },

  preferences: {
    get: <T>(key: string, defaultValue: T): Promise<T> =>
      ipcRenderer.invoke('preferences:get', key, defaultValue),

    set: <T>(key: string, value: T): Promise<void> =>
      ipcRenderer.invoke('preferences:set', key, value),
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
