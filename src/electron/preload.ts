import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  platform: string;
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };
  openExternal: (url: string) => void;
}

const api: ElectronAPI = {
  platform: process.platform,

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  openExternal: (url: string) => {
    const allowedProtocols = ['https:', 'http:'];
    try {
      const parsed = new URL(url);
      if (allowedProtocols.includes(parsed.protocol)) {
        ipcRenderer.send('shell:openExternal', url);
      }
    } catch {
      // ignore invalid URLs
    }
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
