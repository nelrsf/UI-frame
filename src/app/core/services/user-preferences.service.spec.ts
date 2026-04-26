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
});
