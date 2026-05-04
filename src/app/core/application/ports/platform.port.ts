import { InjectionToken } from '@angular/core';

export type PlatformName = 'win32' | 'darwin' | 'linux';

export interface IPlatformService {
  readonly platform: PlatformName;
  readonly isWindows: boolean;
  readonly isMac: boolean;
  readonly isLinux: boolean;
  /** CSS class token derived from the platform (e.g. `platform-win32`). */
  readonly platformClass: string;
}

export const PLATFORM_SERVICE = new InjectionToken<IPlatformService>('PLATFORM_SERVICE');
