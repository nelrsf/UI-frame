import { Injectable } from '@angular/core';
import { IPreferencesService } from '../../../application/ports/preferences.port';

/** Shape of the Electron preload API exposed on `window.electronAPI`. */
interface ElectronBridgeWindow extends Window {
  electronAPI?: {
    preferences?: {
      get<T>(key: string, defaultValue: T): Promise<T>;
      set<T>(key: string, value: T): Promise<void>;
    };
  };
}

/**
 * Reads and writes workspace preferences through the Electron preload bridge.
 * Falls back to a no-op / default-returning implementation when running
 * outside Electron (e.g. browser dev mode).
 */
@Injectable({ providedIn: 'root' })
export class PreferencesAdapter implements IPreferencesService {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    const win = window as ElectronBridgeWindow;
    if (win.electronAPI?.preferences) {
      return win.electronAPI.preferences.get(key, defaultValue);
    }
    return defaultValue;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const win = window as ElectronBridgeWindow;
    if (win.electronAPI?.preferences) {
      return win.electronAPI.preferences.set(key, value);
    }
  }
}
