import { TestBed } from '@angular/core/testing';
import { ShellShortcutsService } from './shell-shortcuts.service';
import { PlatformAdapter } from '../infrastructure/electron/adapters/platform.adapter';
import { PlatformServiceStub } from './platform.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Configures the TestBed with a PlatformAdapter stub for the given OS. */
function setupService(platform: 'darwin' | 'win32' | 'linux'): ShellShortcutsService {
  TestBed.configureTestingModule({
    providers: [
      { provide: PlatformAdapter, useValue: new PlatformServiceStub(platform) },
    ],
  });
  return TestBed.inject(ShellShortcutsService);
}

// ---------------------------------------------------------------------------
// normalize()
// ---------------------------------------------------------------------------

describe('ShellShortcutsService', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('normalize() — macOS', () => {
    it('should replace Mod with Cmd on macOS', () => {
      const service = setupService('darwin');
      expect(service.normalize('Mod+S')).toBe('Cmd+S');
    });

    it('should replace Mod in a multi-modifier shortcut on macOS', () => {
      const service = setupService('darwin');
      expect(service.normalize('Mod+Shift+P')).toBe('Cmd+Shift+P');
    });

    it('should replace all Mod occurrences in a shortcut string on macOS', () => {
      const service = setupService('darwin');
      expect(service.normalize('Mod+Mod+X')).toBe('Cmd+Cmd+X');
    });

    it('should not alter non-Mod tokens on macOS', () => {
      const service = setupService('darwin');
      expect(service.normalize('Ctrl+Alt+Del')).toBe('Ctrl+Alt+Del');
    });

    it('should leave a shortcut without Mod unchanged on macOS', () => {
      const service = setupService('darwin');
      expect(service.normalize('F5')).toBe('F5');
    });
  });

  describe('normalize() — Windows', () => {
    it('should replace Mod with Ctrl on Windows', () => {
      const service = setupService('win32');
      expect(service.normalize('Mod+S')).toBe('Ctrl+S');
    });

    it('should replace Mod in a multi-modifier shortcut on Windows', () => {
      const service = setupService('win32');
      expect(service.normalize('Mod+Shift+P')).toBe('Ctrl+Shift+P');
    });

    it('should not alter non-Mod tokens on Windows', () => {
      const service = setupService('win32');
      expect(service.normalize('Alt+F4')).toBe('Alt+F4');
    });
  });

  describe('normalize() — Linux', () => {
    it('should replace Mod with Ctrl on Linux', () => {
      const service = setupService('linux');
      expect(service.normalize('Mod+Z')).toBe('Ctrl+Z');
    });

    it('should replace Mod in a multi-modifier shortcut on Linux', () => {
      const service = setupService('linux');
      expect(service.normalize('Mod+Shift+Z')).toBe('Ctrl+Shift+Z');
    });
  });

  // ---------------------------------------------------------------------------
  // getDisplayLabel()
  // ---------------------------------------------------------------------------

  describe('getDisplayLabel() — macOS', () => {
    it('should return undefined when command has no shortcut', () => {
      const service = setupService('darwin');
      expect(service.getDisplayLabel({ id: 'cmd.none', label: 'None', execute: () => {} })).toBeUndefined();
    });

    it('should normalize Mod in shortcut when no shortcutMac is set', () => {
      const service = setupService('darwin');
      const label = service.getDisplayLabel({ id: 'cmd.a', label: 'A', shortcut: 'Mod+S', execute: () => {} });
      expect(label).toBe('Cmd+S');
    });

    it('should prefer shortcutMac over shortcut on macOS', () => {
      const service = setupService('darwin');
      const label = service.getDisplayLabel({
        id: 'cmd.b',
        label: 'B',
        shortcut: 'Mod+S',
        shortcutMac: 'Cmd+Option+S',
        execute: () => {},
      });
      expect(label).toBe('Cmd+Option+S');
    });

    it('should normalize Mod in shortcutMac on macOS', () => {
      const service = setupService('darwin');
      const label = service.getDisplayLabel({
        id: 'cmd.c',
        label: 'C',
        shortcut: 'Mod+S',
        shortcutMac: 'Mod+Option+S',
        execute: () => {},
      });
      expect(label).toBe('Cmd+Option+S');
    });

    it('should return shortcutMac when shortcut is absent on macOS', () => {
      const service = setupService('darwin');
      const label = service.getDisplayLabel({
        id: 'cmd.d',
        label: 'D',
        shortcutMac: 'Cmd+K',
        execute: () => {},
      });
      expect(label).toBe('Cmd+K');
    });
  });

  describe('getDisplayLabel() — Windows', () => {
    it('should return undefined when command has no shortcut', () => {
      const service = setupService('win32');
      expect(service.getDisplayLabel({ id: 'cmd.none', label: 'None', execute: () => {} })).toBeUndefined();
    });

    it('should normalize Mod in shortcut on Windows', () => {
      const service = setupService('win32');
      const label = service.getDisplayLabel({ id: 'cmd.e', label: 'E', shortcut: 'Mod+S', execute: () => {} });
      expect(label).toBe('Ctrl+S');
    });

    it('should ignore shortcutMac on Windows and use shortcut', () => {
      const service = setupService('win32');
      const label = service.getDisplayLabel({
        id: 'cmd.f',
        label: 'F',
        shortcut: 'Mod+S',
        shortcutMac: 'Cmd+Option+S',
        execute: () => {},
      });
      expect(label).toBe('Ctrl+S');
    });

    it('should return undefined when only shortcutMac is set on Windows', () => {
      const service = setupService('win32');
      const label = service.getDisplayLabel({
        id: 'cmd.g',
        label: 'G',
        shortcutMac: 'Cmd+K',
        execute: () => {},
      });
      expect(label).toBeUndefined();
    });
  });

  describe('getDisplayLabel() — Linux', () => {
    it('should normalize Mod in shortcut on Linux', () => {
      const service = setupService('linux');
      const label = service.getDisplayLabel({ id: 'cmd.h', label: 'H', shortcut: 'Mod+Z', execute: () => {} });
      expect(label).toBe('Ctrl+Z');
    });

    it('should ignore shortcutMac on Linux', () => {
      const service = setupService('linux');
      const label = service.getDisplayLabel({
        id: 'cmd.i',
        label: 'I',
        shortcut: 'Mod+Z',
        shortcutMac: 'Cmd+Z',
        execute: () => {},
      });
      expect(label).toBe('Ctrl+Z');
    });
  });
});
