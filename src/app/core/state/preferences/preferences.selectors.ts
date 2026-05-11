import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PreferencesState } from './preferences.reducer';
import { AppTheme, DEFAULT_THEME, THEME_PREFERENCE_KEY } from '../../models/theme.model';

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

/** Returns the active theme from preferences, defaulting to DEFAULT_THEME. */
export const selectActiveTheme = createSelector(
  selectPreferencesData,
  (data): AppTheme => {
    const stored = data[THEME_PREFERENCE_KEY];
    return stored === 'dark' || stored === 'light' ? stored : DEFAULT_THEME;
  }
);
