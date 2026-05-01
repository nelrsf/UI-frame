import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SessionState } from './session.reducer';

export const selectSessionState = createFeatureSelector<SessionState>('session');

export const selectPlatform = createSelector(
  selectSessionState,
  (state) => state.platform
);

export const selectShellReady = createSelector(
  selectSessionState,
  (state) => state.shellReady
);

export const selectShellReadyTimestamp = createSelector(
  selectSessionState,
  (state) => state.shellReadyTimestamp
);
