import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PreferencesState } from './preferences.reducer';

export const selectPreferencesState =
  createFeatureSelector<PreferencesState>('preferences');

export const selectPreferencesData = createSelector(
  selectPreferencesState,
  (state) => state.data
);

export const selectPreferencesLoaded = createSelector(
  selectPreferencesState,
  (state) => state.loaded
);

export const selectPreferencesWorkspaceId = createSelector(
  selectPreferencesState,
  (state) => state.workspaceId
);

/** Returns the value stored under `key`, or `undefined` if absent. */
export const selectPreference = (key: string) =>
  createSelector(selectPreferencesData, (data) => data[key]);
