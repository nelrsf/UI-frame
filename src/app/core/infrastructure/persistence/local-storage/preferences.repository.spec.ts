import { TestBed } from '@angular/core/testing';
import { PreferencesRepository } from './preferences.repository';
import { PREFERENCES_SCHEMA_VERSION } from '../../../models/preferences.model';

describe('PreferencesRepository', () => {
  let repo: PreferencesRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repo = TestBed.inject(PreferencesRepository);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  describe('storageKey', () => {
    it('should include workspaceId and schema version', () => {
      const key = repo.storageKey('my-ws');
      expect(key).toContain('my-ws');
      expect(key).toContain(String(PREFERENCES_SCHEMA_VERSION));
    });

    it('should match the exact format prefs:{workspaceId}:v{version}', () => {
      const key = repo.storageKey('ws-abc');
      expect(key).toBe(`prefs:ws-abc:v${PREFERENCES_SCHEMA_VERSION}`);
    });
  });

  describe('has', () => {
    it('should return false when nothing is stored', () => {
      expect(repo.has('empty-ws')).toBeFalse();
    });

    it('should return true after saving data', () => {
      repo.save('present-ws', { key: 'value' });
      expect(repo.has('present-ws')).toBeTrue();
    });

    it('should return false after clearing data', () => {
      repo.save('gone-ws', { key: 'value' });
      repo.clear('gone-ws');
      expect(repo.has('gone-ws')).toBeFalse();
    });

    it('should return false for corrupt JSON', () => {
      localStorage.setItem(repo.storageKey('corrupt-has-ws'), '{ not valid json }');
      expect(repo.has('corrupt-has-ws')).toBeFalse();
    });

    it('should return false when data field is null', () => {
      localStorage.setItem(repo.storageKey('null-data-has-ws'), JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        workspaceId: 'null-data-has-ws',
        savedAt: new Date().toISOString(),
        data: null,
      }));
      expect(repo.has('null-data-has-ws')).toBeFalse();
    });
  });

  describe('load', () => {
    it('should return empty object when nothing is stored', () => {
      expect(repo.load('new-ws')).toEqual({});
    });

    it('should return stored data for valid envelope', () => {
      repo.save('ws-1', { theme: 'dark', fontSize: 14 });
      expect(repo.load('ws-1')).toEqual({ theme: 'dark', fontSize: 14 });
    });

    it('should return empty object for corrupt JSON', () => {
      localStorage.setItem(repo.storageKey('bad-ws'), '{ not valid json }');
      expect(repo.load('bad-ws')).toEqual({});
    });

    it('should return empty object when schemaVersion mismatches', () => {
      localStorage.setItem(repo.storageKey('mismatch-ws'), JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION - 1,
        workspaceId: 'mismatch-ws',
        savedAt: new Date().toISOString(),
        data: { key: 'value' },
      }));
      expect(repo.load('mismatch-ws')).toEqual({});
    });

    it('should return empty object when workspaceId mismatches', () => {
      localStorage.setItem(repo.storageKey('ws-a'), JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        workspaceId: 'ws-b',
        savedAt: new Date().toISOString(),
        data: { key: 'value' },
      }));
      expect(repo.load('ws-a')).toEqual({});
    });

    it('should return empty object when data field is an array', () => {
      localStorage.setItem(repo.storageKey('array-ws'), JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        workspaceId: 'array-ws',
        savedAt: new Date().toISOString(),
        data: [1, 2, 3],
      }));
      expect(repo.load('array-ws')).toEqual({});
    });

    it('should return empty object when savedAt field is missing', () => {
      localStorage.setItem(repo.storageKey('no-ts-ws'), JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        workspaceId: 'no-ts-ws',
        data: { key: 'value' },
      }));
      expect(repo.load('no-ts-ws')).toEqual({});
    });

    it('should return empty object when data field is null', () => {
      localStorage.setItem(repo.storageKey('null-data-load-ws'), JSON.stringify({
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        workspaceId: 'null-data-load-ws',
        savedAt: new Date().toISOString(),
        data: null,
      }));
      expect(repo.load('null-data-load-ws')).toEqual({});
    });
  });

  describe('save', () => {
    it('should persist data that can be loaded back', () => {
      repo.save('ws-save', { lang: 'es', compact: true });
      expect(repo.load('ws-save')).toEqual({ lang: 'es', compact: true });
    });

    it('should overwrite previously saved data', () => {
      repo.save('ws-overwrite', { a: 1 });
      repo.save('ws-overwrite', { a: 2, b: 3 });
      expect(repo.load('ws-overwrite')).toEqual({ a: 2, b: 3 });
    });

    it('should isolate data by workspaceId', () => {
      repo.save('ws-x', { color: 'red' });
      repo.save('ws-y', { color: 'blue' });
      expect(repo.load('ws-x')).toEqual({ color: 'red' });
      expect(repo.load('ws-y')).toEqual({ color: 'blue' });
    });

    it('should include a savedAt ISO timestamp in the stored envelope', () => {
      repo.save('ws-ts', { key: 'value' });
      const raw = localStorage.getItem(repo.storageKey('ws-ts'));
      expect(raw).not.toBeNull();
      const envelope = JSON.parse(raw!);
      expect(typeof envelope['savedAt']).toBe('string');
      expect(envelope['savedAt']).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('clear', () => {
    it('should remove persisted data for the workspace', () => {
      repo.save('ws-clear', { key: 'value' });
      repo.clear('ws-clear');
      expect(repo.load('ws-clear')).toEqual({});
    });

    it('should not affect other workspaces', () => {
      repo.save('ws-keep', { data: 1 });
      repo.save('ws-del', { data: 2 });
      repo.clear('ws-del');
      expect(repo.load('ws-keep')).toEqual({ data: 1 });
    });
  });
});

