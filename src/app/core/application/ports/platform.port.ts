import { InjectionToken } from '@angular/core';

export type PlatformName = 'win32' | 'darwin' | 'linux';

export interface IPlatformService {
  readonly platform: PlatformName;
  readonly isWindows: boolean;
  readonly isMac: boolean;
  readonly isLinux: boolean;
}

export const PLATFORM_SERVICE = new InjectionToken<IPlatformService>('PLATFORM_SERVICE');
