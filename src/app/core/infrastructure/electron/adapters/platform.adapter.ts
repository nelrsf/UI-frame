import { Injectable } from '@angular/core';
import { IPlatformService, PlatformName } from '../../../application/ports/platform.port';

/** Shape of the Electron preload API exposed on `window.electronAPI`. */
interface ElectronBridgeWindow extends Window {
  electronAPI?: {
    platform?: string;
    system?: {
      getPlatform?: () => Promise<string>;
    };
  };
}

/**
 * Resolves the current OS platform from the Electron preload bridge.
 * Falls back to `'linux'` when running outside Electron (e.g. browser dev mode).
 */
@Injectable({ providedIn: 'root' })
export class PlatformAdapter implements IPlatformService {
  readonly platform: PlatformName;

  constructor() {
    this.platform = this.resolvePlatform();
  }

  get isWindows(): boolean {
    return this.platform === 'win32';
  }

  get isMac(): boolean {
    return this.platform === 'darwin';
  }

  get isLinux(): boolean {
    return this.platform === 'linux';
  }

  private resolvePlatform(): PlatformName {
    const win = window as ElectronBridgeWindow;
    const raw = win.electronAPI?.platform ?? '';
    if (raw === 'win32' || raw === 'darwin' || raw === 'linux') {
      return raw;
    }
    return 'linux';
  }
}
