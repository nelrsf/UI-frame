import { Injectable } from '@angular/core';
import { IPlatformService, PlatformName } from '../application/ports/platform.port';
import { PlatformAdapter } from '../infrastructure/electron/adapters/platform.adapter';

export { IPlatformService, PlatformName };

/**
 * Application-level platform service.
 *
 * Delegates to the `PlatformAdapter` so that UI components never access
 * Electron APIs directly.  The service is swappable via DI for testing or
 * future web-only builds.
 */
@Injectable({ providedIn: 'root' })
export class PlatformService implements IPlatformService {
  readonly platform: PlatformName;

  constructor(private readonly adapter: PlatformAdapter) {
    this.platform = adapter.platform;
  }

  get isWindows(): boolean {
    return this.adapter.isWindows;
  }

  get isMac(): boolean {
    return this.adapter.isMac;
  }

  get isLinux(): boolean {
    return this.adapter.isLinux;
  }

  /** CSS class applied to the shell host element for platform-specific styling. */
  get platformClass(): string {
    return `platform-${this.platform}`;
  }
}

// ---------------------------------------------------------------------------
// Testable stub (useful in unit tests without real Electron context)
// ---------------------------------------------------------------------------

/**
 * In-memory stub implementing `IPlatformService`.
 * Inject via DI override in tests:
 * ```ts
 * { provide: PlatformAdapter, useValue: new PlatformServiceStub('darwin') }
 * ```
 * `PlatformServiceStub` satisfies the structural shape expected by `PlatformService`,
 * so it can be provided as a `PlatformAdapter` replacement in the Angular DI tree.
 */
export class PlatformServiceStub implements IPlatformService {
  readonly platform: PlatformName;

  constructor(platform: PlatformName = 'linux') {
    this.platform = platform;
  }

  get isWindows(): boolean { return this.platform === 'win32'; }
  get isMac(): boolean { return this.platform === 'darwin'; }
  get isLinux(): boolean { return this.platform === 'linux'; }
  get platformClass(): string { return `platform-${this.platform}`; }
}
