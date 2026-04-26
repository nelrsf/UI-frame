import { InjectionToken } from '@angular/core';

/**
 * Port contract for reading and writing persisted workspace preferences.
 *
 * Presentation code MUST depend on this interface rather than calling
 * `window.electronAPI.preferences` directly, so the adapter layer can be
 * swapped during testing or in non-Electron environments (e.g. browser dev
 * mode backed by `localStorage`).
 */
export interface IPreferencesService {
  /**
   * Retrieve the preference stored under `key`.
   * Returns `defaultValue` when the key is absent or the stored value cannot
   * be deserialized.
   */
  get<T>(key: string, defaultValue: T): Promise<T>;

  /**
   * Persist `value` under `key`.
   * Implementations MUST NOT reject unless the operation is unrecoverable.
   */
  set<T>(key: string, value: T): Promise<void>;
}

export const PREFERENCES_SERVICE = new InjectionToken<IPreferencesService>(
  'PREFERENCES_SERVICE',
);
