import { Injectable } from '@angular/core';
import { IWindowControlsService } from '../../../application/ports/window-controls.port';

/** Shape of the Electron preload API exposed on `window.electronAPI`. */
interface ElectronBridgeWindow extends Window {
  electronAPI?: {
    window?: {
      minimize(): void;
      maximize(): void;
      close(): void;
      isMaximized(): Promise<boolean>;
    };
  };
}

/**
 * Delegates window control operations to the Electron preload bridge.
 * Calls are silently dropped when running outside Electron (e.g. browser dev
 * mode), so presentation code never needs to guard against a missing bridge.
 */
@Injectable({ providedIn: 'root' })
export class WindowControlsAdapter implements IWindowControlsService {
  minimize(): void {
    const win = window as ElectronBridgeWindow;
    win.electronAPI?.window?.minimize();
  }

  maximize(): void {
    const win = window as ElectronBridgeWindow;
    win.electronAPI?.window?.maximize();
  }

  close(): void {
    const win = window as ElectronBridgeWindow;
    win.electronAPI?.window?.close();
  }

  isMaximized(): Promise<boolean> {
    const win = window as ElectronBridgeWindow;
    if (win.electronAPI?.window) {
      return win.electronAPI.window.isMaximized();
    }
    return Promise.resolve(false);
  }
}
