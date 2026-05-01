import { TestBed } from '@angular/core/testing';
import { PreferencesAdapter } from './preferences.adapter';

/**
 * Typed window extension used only in these tests to avoid unchecked `any`
 * assertions throughout.
 */
interface TestWindow extends Window {
  electronAPI?: {
    preferences?: {
      get<T>(key: string, defaultValue: T): Promise<T>;
      set<T>(key: string, value: T): Promise<void>;
    };
  };
}

describe('PreferencesAdapter', () => {
  let adapter: PreferencesAdapter;
  let originalElectronAPI: TestWindow['electronAPI'];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(PreferencesAdapter);
    originalElectronAPI = (window as TestWindow).electronAPI;
  });

  afterEach(() => {
    // Restore window.electronAPI to prevent cross-test pollution.
    (window as TestWindow).electronAPI = originalElectronAPI;
  });

  // ---------------------------------------------------------------------------
  // get — bridge absent
  // ---------------------------------------------------------------------------

  describe('get — Electron bridge absent', () => {
    beforeEach(() => {
      (window as TestWindow).electronAPI = undefined;
    });

    it('should return the defaultValue (string) when electronAPI is absent', async () => {
      expect(await adapter.get('theme', 'dark')).toBe('dark');
    });

    it('should return the defaultValue (number) when electronAPI is absent', async () => {
      expect(await adapter.get('fontSize', 14)).toBe(14);
    });

    it('should return the defaultValue (boolean) when electronAPI is absent', async () => {
      expect(await adapter.get('compact', true)).toBeTrue();
    });

    it('should return the defaultValue (object) when electronAPI is absent', async () => {
      const def = { sidebar: 240 };
      expect(await adapter.get('layout', def)).toEqual(def);
    });

    it('should return the defaultValue when electronAPI exists but has no preferences key', async () => {
      (window as TestWindow).electronAPI = {} as TestWindow['electronAPI'];
      expect(await adapter.get('theme', 'fallback')).toBe('fallback');
    });
  });

  // ---------------------------------------------------------------------------
  // get — bridge present
  // ---------------------------------------------------------------------------

  describe('get — Electron bridge present', () => {
    let getSpy: jasmine.Spy;
    let setSpy: jasmine.Spy;

    beforeEach(() => {
      getSpy = jasmine.createSpy('get').and.returnValue(Promise.resolve('light'));
      setSpy = jasmine.createSpy('set').and.returnValue(Promise.resolve());
      (window as TestWindow).electronAPI = { preferences: { get: getSpy, set: setSpy } };
    });

    it('should delegate to the IPC bridge and return its value', async () => {
      const result = await adapter.get('theme', 'dark');
      expect(result).toBe('light');
    });

    it('should forward key and defaultValue to the bridge', async () => {
      await adapter.get('theme', 'dark');
      expect(getSpy).toHaveBeenCalledOnceWith('theme', 'dark');
    });

    it('should return the bridge value for a numeric type', async () => {
      getSpy.and.returnValue(Promise.resolve(18));
      expect(await adapter.get('fontSize', 12)).toBe(18);
    });

    it('should return the bridge value for an object type', async () => {
      const stored = { sidebar: 300 };
      getSpy.and.returnValue(Promise.resolve(stored));
      expect(await adapter.get('layout', {})).toEqual(stored);
    });
  });

  // ---------------------------------------------------------------------------
  // set — bridge absent
  // ---------------------------------------------------------------------------

  describe('set — Electron bridge absent', () => {
    beforeEach(() => {
      (window as TestWindow).electronAPI = undefined;
    });

    it('should resolve without error when electronAPI is absent', async () => {
      await expectAsync(adapter.set('theme', 'dark')).toBeResolved();
    });

    it('should resolve without error when electronAPI has no preferences key', async () => {
      (window as TestWindow).electronAPI = {} as TestWindow['electronAPI'];
      await expectAsync(adapter.set('theme', 'dark')).toBeResolved();
    });
  });

  // ---------------------------------------------------------------------------
  // set — bridge present
  // ---------------------------------------------------------------------------

  describe('set — Electron bridge present', () => {
    let setSpy: jasmine.Spy;

    beforeEach(() => {
      setSpy = jasmine.createSpy('set').and.returnValue(Promise.resolve());
      (window as TestWindow).electronAPI = {
        preferences: {
          get: jasmine.createSpy('get').and.returnValue(Promise.resolve(undefined)),
          set: setSpy,
        },
      };
    });

    it('should delegate to the IPC bridge', async () => {
      await adapter.set('theme', 'dark');
      expect(setSpy).toHaveBeenCalledOnceWith('theme', 'dark');
    });

    it('should persist a number value', async () => {
      await adapter.set('fontSize', 16);
      expect(setSpy).toHaveBeenCalledOnceWith('fontSize', 16);
    });

    it('should persist a boolean value', async () => {
      await adapter.set('compact', true);
      expect(setSpy).toHaveBeenCalledOnceWith('compact', true);
    });

    it('should persist an object value', async () => {
      const val = { sidebar: 280 };
      await adapter.set('layout', val);
      expect(setSpy).toHaveBeenCalledOnceWith('layout', val);
    });

    it('should resolve the returned Promise on success', async () => {
      await expectAsync(adapter.set('theme', 'dark')).toBeResolved();
    });
  });

  // ---------------------------------------------------------------------------
  // IPC round-trip simulation
  // ---------------------------------------------------------------------------

  describe('IPC round-trip simulation', () => {
    beforeEach(() => {
      // Simulate an in-memory IPC store similar to the Electron handler.
      const store: Record<string, unknown> = {};
      (window as TestWindow).electronAPI = {
        preferences: {
          get: <T>(key: string, def: T) =>
            Promise.resolve((key in store ? store[key] : def) as T),
          set: <T>(key: string, val: T) => {
            store[key] = val;
            return Promise.resolve();
          },
        },
      };
    });

    it('should return the value that was previously set', async () => {
      await adapter.set('color', 'blue');
      expect(await adapter.get('color', 'red')).toBe('blue');
    });

    it('should return the defaultValue for a key that was never set', async () => {
      expect(await adapter.get('missing', 42)).toBe(42);
    });

    it('should reflect the most recently set value', async () => {
      await adapter.set('color', 'green');
      await adapter.set('color', 'purple');
      expect(await adapter.get('color', 'red')).toBe('purple');
    });

    it('should store multiple independent keys without interference', async () => {
      await adapter.set('alpha', 1);
      await adapter.set('beta', 2);
      expect(await adapter.get('alpha', 0)).toBe(1);
      expect(await adapter.get('beta', 0)).toBe(2);
    });
  });
});
