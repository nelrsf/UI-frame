import { preferencesReducer, initialPreferencesState, PreferencesState } from './preferences.reducer';
import * as PreferencesActions from './preferences.actions';
import {
  selectPreferencesData,
  selectPreferencesLoaded,
  selectPreferencesWorkspaceId,
  selectPreference,
} from './preferences.selectors';

// ---------------------------------------------------------------------------
// preferences reducer
// ---------------------------------------------------------------------------

describe('preferences reducer', () => {
  it('should return the initial state for unknown actions', () => {
    const state = preferencesReducer(undefined, { type: '__unknown__' });
    expect(state).toEqual(initialPreferencesState);
  });

  it('should start with an empty data map, loaded=false, and no workspaceId', () => {
    expect(initialPreferencesState.data).toEqual({});
    expect(initialPreferencesState.loaded).toBeFalse();
    expect(initialPreferencesState.workspaceId).toBe('');
  });

  // ── loadPreferencesSuccess ───────────────────────────────────────────────

  describe('loadPreferencesSuccess', () => {
    it('should set data and mark loaded as true', () => {
      const data = { theme: 'dark', fontSize: 14 };
      const state = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-1', data })
      );
      expect(state.data).toEqual(data);
      expect(state.loaded).toBeTrue();
    });

    it('should set workspaceId to the provided value', () => {
      const state = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-abc', data: {} })
      );
      expect(state.workspaceId).toBe('ws-abc');
    });

    it('should replace any previously loaded data', () => {
      const first = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-1', data: { a: 1 } })
      );
      const second = preferencesReducer(
        first,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-2', data: { b: 2 } })
      );
      expect(second.data).toEqual({ b: 2 });
      expect(second.workspaceId).toBe('ws-2');
    });

    it('should set loaded=true even when data is empty', () => {
      const state = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-empty', data: {} })
      );
      expect(state.loaded).toBeTrue();
      expect(state.data).toEqual({});
    });
  });

  // ── loadPreferencesFailure ────────────────────────────────────────────────

  describe('loadPreferencesFailure', () => {
    it('should reset data to an empty map and mark loaded as true', () => {
      const state = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesFailure({ workspaceId: 'ws-fail', error: 'IPC error' })
      );
      expect(state.data).toEqual({});
      expect(state.loaded).toBeTrue();
    });

    it('should set workspaceId even on failure', () => {
      const state = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesFailure({ workspaceId: 'ws-err', error: 'timeout' })
      );
      expect(state.workspaceId).toBe('ws-err');
    });

    it('should clear any previously loaded data when a failure occurs', () => {
      const loaded = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-1', data: { theme: 'dark' } })
      );
      const failed = preferencesReducer(
        loaded,
        PreferencesActions.loadPreferencesFailure({ workspaceId: 'ws-1', error: 'oops' })
      );
      expect(failed.data).toEqual({});
    });
  });

  // ── setPreferenceSuccess ──────────────────────────────────────────────────

  describe('setPreferenceSuccess', () => {
    it('should add a new key to data', () => {
      const loaded = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-1', data: {} })
      );
      const state = preferencesReducer(
        loaded,
        PreferencesActions.setPreferenceSuccess({ key: 'theme', value: 'light' })
      );
      expect(state.data['theme']).toBe('light');
    });

    it('should overwrite an existing key', () => {
      const loaded = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-1', data: { theme: 'dark' } })
      );
      const state = preferencesReducer(
        loaded,
        PreferencesActions.setPreferenceSuccess({ key: 'theme', value: 'light' })
      );
      expect(state.data['theme']).toBe('light');
    });

    it('should preserve other existing keys when setting a new key', () => {
      const loaded = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-1', data: { a: 1, b: 2 } })
      );
      const state = preferencesReducer(
        loaded,
        PreferencesActions.setPreferenceSuccess({ key: 'c', value: 3 })
      );
      expect(state.data['a']).toBe(1);
      expect(state.data['b']).toBe(2);
      expect(state.data['c']).toBe(3);
    });

    it('should not change workspaceId or loaded when setting a preference', () => {
      const loaded = preferencesReducer(
        initialPreferencesState,
        PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-set', data: {} })
      );
      const state = preferencesReducer(
        loaded,
        PreferencesActions.setPreferenceSuccess({ key: 'x', value: 42 })
      );
      expect(state.workspaceId).toBe('ws-set');
      expect(state.loaded).toBeTrue();
    });
  });
});

// ---------------------------------------------------------------------------
// preferences selectors
// ---------------------------------------------------------------------------

describe('preferences selectors', () => {
  const state: { preferences: PreferencesState } = {
    preferences: {
      workspaceId: 'ws-sel',
      data: { theme: 'dark', fontSize: 16 },
      loaded: true,
    },
  };

  it('selectPreferencesData should return the data map', () => {
    expect(selectPreferencesData(state)).toEqual({ theme: 'dark', fontSize: 16 });
  });

  it('selectPreferencesLoaded should return the loaded flag', () => {
    expect(selectPreferencesLoaded(state)).toBeTrue();
  });

  it('selectPreferencesWorkspaceId should return the workspaceId', () => {
    expect(selectPreferencesWorkspaceId(state)).toBe('ws-sel');
  });

  it('selectPreference should return the value for a known key', () => {
    expect(selectPreference('theme')(state)).toBe('dark');
  });

  it('selectPreference should return undefined for an unknown key', () => {
    expect(selectPreference('missing')(state)).toBeUndefined();
  });

  it('selectPreferencesLoaded should return false when not yet loaded', () => {
    const unloaded: { preferences: PreferencesState } = {
      preferences: { ...state.preferences, loaded: false },
    };
    expect(selectPreferencesLoaded(unloaded)).toBeFalse();
  });

  it('selectPreferencesData should return an empty map when no data is loaded', () => {
    const empty: { preferences: PreferencesState } = {
      preferences: { workspaceId: '', data: {}, loaded: false },
    };
    expect(selectPreferencesData(empty)).toEqual({});
  });
});
