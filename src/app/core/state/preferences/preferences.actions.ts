import { createAction, props } from '@ngrx/store';

/**
 * Triggers loading the full preferences blob for the given workspace from the
 * IPC bridge.  Dispatched during workspace initialization.
 */
export const loadPreferences = createAction(
  '[Preferences] Load',
  props<{ workspaceId: string }>()
);

/**
 * Dispatched by the PreferencesEffects when the adapter successfully returns
 * the stored preferences for the workspace.
 */
export const loadPreferencesSuccess = createAction(
  '[Preferences] Load Success',
  props<{ workspaceId: string; data: Record<string, unknown> }>()
);

/**
 * Dispatched by the PreferencesEffects when the IPC bridge rejects or the
 * deserialized value is invalid.  The reducer responds by resetting `data` to
 * an empty map so the shell always has a safe default state.
 */
export const loadPreferencesFailure = createAction(
  '[Preferences] Load Failure',
  props<{ workspaceId: string; error: string }>()
);

/**
 * Requests that a single preference key be updated both in the store and
 * persisted via the IPC bridge.
 */
export const setPreference = createAction(
  '[Preferences] Set',
  props<{ key: string; value: unknown }>()
);

/**
 * Dispatched by the PreferencesEffects after a successful (or silently failed)
 * write to the IPC bridge.  The reducer applies the key change to `data`.
 */
export const setPreferenceSuccess = createAction(
  '[Preferences] Set Success',
  props<{ key: string; value: unknown }>()
);
