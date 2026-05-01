import { TestBed } from '@angular/core/testing';
import { UserPreferencesService } from '../core/services/user-preferences.service';
import { PreferencesRepository } from '../core/infrastructure/persistence/local-storage/preferences.repository';
import { PREFERENCES_SCHEMA_VERSION } from '../core/models/preferences.model';

/**
 * Shell workspace persistence integration tests.
 *
 * These tests verify that the workspace preference restoration pipeline
 * behaves correctly for valid, invalid, and missing persisted states.
 * Tests are deliberately decoupled from visual rendering so that UI polish
 * changes do not break restoration regressions.
 *
 * Coverage:
 * - FR-Preferences: correct round-trip through the persistence layer
 * - FR-Security: corrupt / schema-mismatched envelopes never expose stale data
 * - DoD-04: independent of UI polish (no DOM assertions)
 */
describe('Shell — workspace persistence', () => {
  let service: UserPreferencesService;
  let repository: PreferencesRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPreferencesService);
    repository = TestBed.inject(PreferencesRepository);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ---------------------------------------------------------------------------
  // Restoration from valid persisted state
  // ---------------------------------------------------------------------------

  describe('restoration from valid persisted state', () => {
    it('should restore all preferences when valid state exists for the workspace', () => {
      repository.save('ws-restore', {
        theme: 'dark',
        sidebarWidth: 240,
        compactMode: true,
      });

      service.initWorkspace('ws-restore');

      expect(service.get('theme', 'light')).toBe('dark');
      expect(service.get('sidebarWidth', 0)).toBe(240);
      expect(service.get('compactMode', false)).toBeTrue();
    });

    it('should emit the restored preferences via preferences$ immediately after initWorkspace', (done) => {
      repository.save('ws-obs', { lang: 'fr' });
      service.initWorkspace('ws-obs');

      service.preferences$.subscribe((prefs) => {
        expect(prefs['lang']).toBe('fr');
        done();
      });
    });

    it('should restore nested object preferences without shallow-merging', () => {
      const layout = { sidebar: 260, panel: 180 };
      repository.save('ws-nested', { layout });

      service.initWorkspace('ws-nested');

      expect(service.get('layout', {})).toEqual(layout);
    });

    it('should restore a boolean false value without treating it as absent', () => {
      repository.save('ws-bool', { autoSave: false });

      service.initWorkspace('ws-bool');

      // false is a valid stored value; defaultValue should NOT be returned
      expect(service.get('autoSave', true)).toBeFalse();
    });
  });

  // ---------------------------------------------------------------------------
  // Fallback behavior for invalid / absent persisted state
  // ---------------------------------------------------------------------------

  describe('fallback behavior for invalid persisted state', () => {
    it('should return the defaultValue when no state has ever been persisted', () => {
      service.initWorkspace('ws-fresh');

      expect(service.get('theme', 'default')).toBe('default');
    });

    it('should return an empty preferences$ emission when no state has been persisted', (done) => {
      service.initWorkspace('ws-fresh-obs');

      service.preferences$.subscribe((prefs) => {
        expect(prefs).toEqual({});
        done();
      });
    });

    it('should fall back to defaults when persisted JSON is syntactically corrupt', () => {
      localStorage.setItem(repository.storageKey('ws-corrupt'), '{ broken json }');

      service.initWorkspace('ws-corrupt');

      expect(service.get('theme', 'fallback')).toBe('fallback');
    });

    it('should fall back to defaults when the schema version is higher than expected', () => {
      localStorage.setItem(
        repository.storageKey('ws-schema-high'),
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION + 1,
          workspaceId: 'ws-schema-high',
          savedAt: new Date().toISOString(),
          data: { secret: 'shouldNotAppear' },
        })
      );

      service.initWorkspace('ws-schema-high');

      expect(service.get('secret', 'absent')).toBe('absent');
    });

    it('should fall back to defaults when the schema version is lower than expected', () => {
      localStorage.setItem(
        repository.storageKey('ws-schema-low'),
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION - 1,
          workspaceId: 'ws-schema-low',
          savedAt: new Date().toISOString(),
          data: { legacy: 'data' },
        })
      );

      service.initWorkspace('ws-schema-low');

      expect(service.get('legacy', 'safe')).toBe('safe');
    });

    it('should fall back to defaults when the workspaceId in the envelope mismatches', () => {
      localStorage.setItem(
        repository.storageKey('ws-mismatch'),
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          workspaceId: 'ws-other',
          savedAt: new Date().toISOString(),
          data: { secret: 'leaked' },
        })
      );

      service.initWorkspace('ws-mismatch');

      expect(service.get('secret', 'safe')).toBe('safe');
    });

    it('should fall back to defaults when the data field is an array instead of an object', () => {
      localStorage.setItem(
        repository.storageKey('ws-array'),
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          workspaceId: 'ws-array',
          savedAt: new Date().toISOString(),
          data: ['not', 'an', 'object'],
        })
      );

      service.initWorkspace('ws-array');

      expect(service.get('anything', 'default')).toBe('default');
    });

    it('should fall back to defaults when the savedAt field is missing', () => {
      localStorage.setItem(
        repository.storageKey('ws-no-ts'),
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          workspaceId: 'ws-no-ts',
          data: { key: 'value' },
        })
      );

      service.initWorkspace('ws-no-ts');

      expect(service.get('key', 'fallback')).toBe('fallback');
    });
  });

  // ---------------------------------------------------------------------------
  // Workspace isolation
  // ---------------------------------------------------------------------------

  describe('workspace isolation', () => {
    it('should not cross-contaminate preferences between workspaces', () => {
      repository.save('ws-iso-a', { color: 'red' });
      repository.save('ws-iso-b', { color: 'blue' });

      service.initWorkspace('ws-iso-a');
      expect(service.get('color', 'none')).toBe('red');

      service.initWorkspace('ws-iso-b');
      expect(service.get('color', 'none')).toBe('blue');
    });

    it('should use defaults for a workspace that has no saved state even when others do', () => {
      repository.save('ws-with-data', { key: 'value' });

      service.initWorkspace('ws-without-data');

      expect(service.get('key', 'default')).toBe('default');
    });

    it('should not expose preferences from a previously active workspace after switching', () => {
      service.initWorkspace('ws-prev');
      service.set('sharedKey', 'from-prev');

      service.initWorkspace('ws-next');

      expect(service.get('sharedKey', 'absent')).toBe('absent');
    });
  });

  // ---------------------------------------------------------------------------
  // Full persistence round-trip
  // ---------------------------------------------------------------------------

  describe('persistence round-trip', () => {
    it('should persist and restore a full multi-type preference set without data loss', () => {
      service.initWorkspace('ws-roundtrip');
      service.set('theme', 'dark');
      service.set('fontSize', 14);
      service.set('sidebarOpen', true);
      service.set('layout', { panel: 200 });

      // Simulate a fresh service instance (e.g. after app restart).
      const fresh = new UserPreferencesService(repository);
      fresh.initWorkspace('ws-roundtrip');

      expect(fresh.get('theme', '')).toBe('dark');
      expect(fresh.get('fontSize', 0)).toBe(14);
      expect(fresh.get('sidebarOpen', false)).toBeTrue();
      expect(fresh.get('layout', {})).toEqual({ panel: 200 });
    });

    it('should reflect the latest value after multiple overwrites', () => {
      service.initWorkspace('ws-overwrite');
      service.set('mode', 'a');
      service.set('mode', 'b');
      service.set('mode', 'c');

      const fresh = new UserPreferencesService(repository);
      fresh.initWorkspace('ws-overwrite');

      expect(fresh.get('mode', '')).toBe('c');
    });

    it('should correctly restore state after a set and partial reset cycle', () => {
      service.initWorkspace('ws-cycle');
      service.set('a', 1);
      service.set('b', 2);
      service.reset('a');
      service.set('c', 3);

      const fresh = new UserPreferencesService(repository);
      fresh.initWorkspace('ws-cycle');

      expect(fresh.get('a', 'absent')).toBe('absent');
      expect(fresh.get('b', 0)).toBe(2);
      expect(fresh.get('c', 0)).toBe(3);
    });

    it('should persist an empty preferences map after a full reset', () => {
      service.initWorkspace('ws-reset');
      service.set('a', 1);
      service.reset();

      const fresh = new UserPreferencesService(repository);
      fresh.initWorkspace('ws-reset');

      expect(fresh.get('a', 'gone')).toBe('gone');
    });
  });
});
