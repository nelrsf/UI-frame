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
 *
 * Return-value validation: if the IPC bridge returns `null`, `undefined`, or a
 * non-object value where the caller supplied an object default, `get` falls
 * back to `defaultValue` so consumers always receive a well-typed result.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesAdapter implements IPreferencesService {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    const win = window as ElectronBridgeWindow;
    if (win.electronAPI?.preferences) {
      const result = await win.electronAPI.preferences.get(key, defaultValue);
      return this.sanitize(result, defaultValue);
    }
    return defaultValue;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const win = window as ElectronBridgeWindow;
    if (win.electronAPI?.preferences) {
      return win.electronAPI.preferences.set(key, value);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns `result` when it is a non-null, type-compatible value; otherwise
   * returns `defaultValue`.  When `defaultValue` is a plain object, `result`
   * must also be a plain (non-array) object to pass validation.
   */
  private sanitize<T>(result: T, defaultValue: T): T {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    if (this.isPlainObject(defaultValue) && !this.isPlainObject(result)) {
      return defaultValue;
    }
    return result;
  }

  /** Returns `true` when `value` is a plain (non-array) object. */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
