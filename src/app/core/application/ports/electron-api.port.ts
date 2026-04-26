import { InjectionToken } from '@angular/core';
import { PlatformName } from './platform.port';

/**
 * Typed shape of the Electron preload API exposed on `window.electronAPI`.
 *
 * This interface mirrors the contract defined in `src/electron/preload.ts` and
 * acts as the single source of truth consumed by application-layer adapters.
 * Presentation code MUST NOT read `window.electronAPI` directly — adapters
 * that implement the fine-grained port interfaces (`IWindowControlsService`,
 * `IPreferencesService`, `IPlatformService`) must be used instead.
 */
export interface IElectronApiPort {
  /**
   * @deprecated Use `system.getPlatform()` instead.
   * Kept for backwards compatibility with adapters that read the synchronous
   * platform value populated by the preload script.
   */
  readonly platform: string;

  /** Window-level control operations. */
  readonly window: {
    minimize(): void;
    maximize(): void;
    close(): void;
    isMaximized(): Promise<boolean>;
  };

  /** System-level utilities. */
  readonly system: {
    getPlatform(): Promise<PlatformName>;
    openExternal(url: string): Promise<boolean>;
  };

  /** Workspace preference persistence. */
  readonly preferences: {
    get<T>(key: string, defaultValue: T): Promise<T>;
    set<T>(key: string, value: T): Promise<void>;
  };
}

/**
 * DI token for the typed Electron bridge accessor.
 *
 * Bind to `IElectronApiPort` in the infrastructure module so that
 * application-layer adapters can retrieve the bridge without importing
 * `window` globals directly.
 */
export const ELECTRON_API_PORT = new InjectionToken<IElectronApiPort>(
  'ELECTRON_API_PORT',
);
