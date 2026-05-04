import { InjectionToken } from '@angular/core';

/**
 * Port contract for Electron window control operations.
 *
 * Presentation code MUST depend on this interface rather than calling
 * `window.electronAPI.window` directly, so the adapter layer can be
 * swapped during testing or in non-Electron environments.
 */
export interface IWindowControlsService {
  /** Minimize the application window. */
  minimize(): void;
  /** Toggle maximize / restore on the application window. */
  maximize(): void;
  /** Close the application window. */
  close(): void;
  /** Resolve whether the application window is currently maximized. */
  isMaximized(): Promise<boolean>;
}

export const WINDOW_CONTROLS_SERVICE = new InjectionToken<IWindowControlsService>(
  'WINDOW_CONTROLS_SERVICE',
);
