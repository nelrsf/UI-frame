import { TestBed } from '@angular/core/testing';
import { UserPreferencesService } from './user-preferences.service';
import { PreferencesRepository } from '../infrastructure/persistence/local-storage/preferences.repository';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let repository: PreferencesRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPreferencesService);
    repository = TestBed.inject(PreferencesRepository);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('workspaceId', () => {
    it('should be empty before initWorkspace is called', () => {
      expect(service.workspaceId).toBe('');
    });

    it('should reflect the workspace after initWorkspace', () => {
      service.initWorkspace('ws-abc');
      expect(service.workspaceId).toBe('ws-abc');
    });
  });

  describe('get — default value fallback', () => {
    beforeEach(() => service.initWorkspace('ws-1'));

    it('should return defaultValue when key is absent', () => {
      expect(service.get('theme', 'dark')).toBe('dark');
    });

    it('should return stored value when key exists', () => {
      service.set('theme', 'light');
      expect(service.get('theme', 'dark')).toBe('light');
    });

    it('should return defaultValue for null stored value', () => {
      service.set('nullable', null);
      expect(service.get('nullable', 42)).toBe(42);
    });
  });

  describe('set / get — typed values', () => {
    beforeEach(() => service.initWorkspace('ws-2'));

    it('should store and retrieve a number', () => {
      service.set('fontSize', 14);
      expect(service.get('fontSize', 12)).toBe(14);
    });

    it('should store and retrieve a boolean', () => {
      service.set('compact', true);
      expect(service.get('compact', false)).toBeTrue();
    });

    it('should store and retrieve an object', () => {
      const layout = { sidebar: 240, bottom: 180 };
      service.set('layout', layout);
      expect(service.get('layout', {})).toEqual(layout);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      service.initWorkspace('ws-3');
      service.set('a', 1);
      service.set('b', 2);
    });

    it('should remove a specific key', () => {
      service.reset('a');
      expect(service.get('a', 99)).toBe(99);
      expect(service.get('b', 99)).toBe(2);
    });

    it('should remove all keys when called without arguments', () => {
      service.reset();
      expect(service.get('a', 99)).toBe(99);
      expect(service.get('b', 99)).toBe(99);
    });
  });

  describe('preferences$ observable', () => {
    it('should emit empty map before any change', (done) => {
      service.initWorkspace('ws-obs');
      service.preferences$.subscribe((prefs) => {
        expect(prefs).toEqual({});
        done();
      });
    });

    it('should emit updated map after set', (done) => {
      service.initWorkspace('ws-obs2');
      const emissions: Record<string, unknown>[] = [];
      service.preferences$.subscribe((prefs) => emissions.push(prefs));

      service.set('x', 10);

      // Last emission should contain the key
      const last = emissions[emissions.length - 1];
      expect(last['x']).toBe(10);
      done();
    });

    it('should emit updated map after reset', (done) => {
      service.initWorkspace('ws-obs3');
      service.set('y', 5);

      const emissions: Record<string, unknown>[] = [];
      service.preferences$.subscribe((prefs) => emissions.push(prefs));

      service.reset('y');

      const last = emissions[emissions.length - 1];
      expect(last['y']).toBeUndefined();
      done();
    });
  });

  describe('workspace isolation', () => {
    it('should keep preferences isolated per workspace', () => {
      service.initWorkspace('ws-a');
      service.set('color', 'red');

      service.initWorkspace('ws-b');
      expect(service.get('color', 'blue')).toBe('blue');
    });

    it('should persist and restore preferences per workspace', () => {
      service.initWorkspace('ws-persist');
      service.set('lang', 'es');

      // Simulate a second service instance reading persisted data
      const service2 = new UserPreferencesService(repository);
      service2.initWorkspace('ws-persist');
      expect(service2.get('lang', 'en')).toBe('es');
    });
  });

  describe('persistence — safe fallback on corruption', () => {
    it('should fall back to defaults when localStorage contains corrupt JSON', () => {
      const key = repository.storageKey('ws-corrupt');
      localStorage.setItem(key, '{ invalid json }');

      service.initWorkspace('ws-corrupt');
      expect(service.get('anything', 'default')).toBe('default');
    });

    it('should fall back to defaults when schema version mismatches', () => {
      const key = repository.storageKey('ws-mismatch');
      // Write envelope with wrong version
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 0,
        workspaceId: 'ws-mismatch',
        data: { hidden: 'value' },
      }));

      service.initWorkspace('ws-mismatch');
      expect(service.get('hidden', 'fallback')).toBe('fallback');
    });
  });

  describe('set before initWorkspace', () => {
    it('should not write to localStorage when workspaceId is not yet set', () => {
      service.set('earlyKey', 'earlyValue');
      expect(localStorage.length).toBe(0);
    });

    it('should still update the in-memory value before initWorkspace', () => {
      service.set('earlyKey', 'earlyValue');
      expect(service.get('earlyKey', 'missing')).toBe('earlyValue');
    });
  });

  describe('re-initialization', () => {
    it('should reload persisted data when the same workspace is re-initialized', () => {
      service.initWorkspace('ws-reload');
      service.set('theme', 'dark');

      service.initWorkspace('ws-reload');
      expect(service.get('theme', 'light')).toBe('dark');
    });
  });

  describe('initWorkspaceFromPath', () => {
    it('should use ws-default when no path is provided', async () => {
      await service.initWorkspaceFromPath();
      expect(service.workspaceId).toBe('ws-default');
    });

    it('should use ws-default for null path', async () => {
      await service.initWorkspaceFromPath(null);
      expect(service.workspaceId).toBe('ws-default');
    });

    it('should use ws-default for empty string', async () => {
      await service.initWorkspaceFromPath('');
      expect(service.workspaceId).toBe('ws-default');
    });

    it('should derive a ws- prefixed ID from a real path', async () => {
      await service.initWorkspaceFromPath('/home/user/project');
      expect(service.workspaceId).toMatch(/^ws-[0-9a-f]{16}$/);
    });

    it('should produce the known ID for a pinned path (algorithm regression guard)', async () => {
      await service.initWorkspaceFromPath('/home/user/project');
      expect(service.workspaceId).toBe('ws-9dad1e4e08b0b11c');
    });

    it('should normalize the path before deriving the ID', async () => {
      await service.initWorkspaceFromPath('/home/user/project/');
      const idWithTrailingSlash = service.workspaceId;

      await service.initWorkspaceFromPath('/home/user/project');
      const idWithoutTrailingSlash = service.workspaceId;

      expect(idWithTrailingSlash).toBe(idWithoutTrailingSlash);
    });

    it('should normalize Windows paths before deriving the ID', async () => {
      await service.initWorkspaceFromPath('C:\\Users\\dev\\project');
      const idWindows = service.workspaceId;

      await service.initWorkspaceFromPath('c:/Users/dev/project');
      const idPosix = service.workspaceId;

      expect(idWindows).toBe(idPosix);
    });

    it('should load persisted preferences scoped to the derived ID', async () => {
      await service.initWorkspaceFromPath('/home/user/project');
      service.set('lang', 'fr');

      const service2 = new UserPreferencesService(repository);
      await service2.initWorkspaceFromPath('/home/user/project');
      expect(service2.get('lang', 'en')).toBe('fr');
    });

    it('should store workspaceRootPath in the envelope when a real path is set', async () => {
      await service.initWorkspaceFromPath('/home/user/project');
      service.set('lang', 'de');

      const raw = localStorage.getItem(repository.storageKey(service.workspaceId));
      expect(raw).not.toBeNull();
      const envelope = JSON.parse(raw!);
      expect(envelope['workspaceRootPath']).toBe('/home/user/project');
    });

    it('should not store workspaceRootPath in the envelope for null path', async () => {
      await service.initWorkspaceFromPath(null);
      service.set('lang', 'de');

      const raw = localStorage.getItem(repository.storageKey(service.workspaceId));
      expect(raw).not.toBeNull();
      const envelope = JSON.parse(raw!);
      expect(envelope['workspaceRootPath']).toBeUndefined();
    });

    it('should clear workspaceRootPath when initWorkspace is called directly after initWorkspaceFromPath', async () => {
      await service.initWorkspaceFromPath('/home/user/project');
      service.initWorkspace('ws-direct');
      service.set('x', 1);

      const raw = localStorage.getItem(repository.storageKey('ws-direct'));
      expect(raw).not.toBeNull();
      const envelope = JSON.parse(raw!);
      expect(envelope['workspaceRootPath']).toBeUndefined();
    });
  });
});
