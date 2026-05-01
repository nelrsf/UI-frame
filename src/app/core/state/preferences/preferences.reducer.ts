import { createReducer, on } from '@ngrx/store';
import * as PreferencesActions from './preferences.actions';

export interface PreferencesState {
  /** Workspace whose preferences are currently loaded. Empty before first load. */
  readonly workspaceId: string;
  /** Current in-memory preferences map for the active workspace. */
  readonly data: Record<string, unknown>;
  /** True once a load attempt (success or failure) has completed. */
  readonly loaded: boolean;
}

export const initialPreferencesState: PreferencesState = {
  workspaceId: '',
  data: {},
  loaded: false,
};

export const preferencesReducer = createReducer(
  initialPreferencesState,
  on(PreferencesActions.loadPreferencesSuccess, (_state, { workspaceId, data }) => ({
    workspaceId,
    data,
    loaded: true,
  })),
  on(PreferencesActions.loadPreferencesFailure, (_state, { workspaceId }) => ({
    workspaceId,
    data: {},
    loaded: true,
  })),
  on(PreferencesActions.setPreferenceSuccess, (state, { key, value }) => ({
    ...state,
    data: { ...state.data, [key]: value },
  }))
);
