import { createReducer, on } from '@ngrx/store';
import { PlatformName } from '../../application/ports/platform.port';
import * as SessionActions from './session.actions';

export interface SessionState {
  /** Detected OS platform. Initialised during shell bootstrap. */
  readonly platform: PlatformName;
  /** True once ShellComponent has completed its initial view initialisation. */
  readonly shellReady: boolean;
  /** Unix timestamp (ms) recorded when shell.ready was first emitted, or null before that. */
  readonly shellReadyTimestamp: number | null;
}

export const initialSessionState: SessionState = {
  // 'linux' mirrors the PlatformAdapter fallback used when running outside Electron
  // (e.g. in tests or a plain browser dev build). It is replaced immediately by
  // the setPlatform action dispatched during ShellComponent.ngAfterViewInit.
  platform: 'linux',
  shellReady: false,
  shellReadyTimestamp: null,
};

export const sessionReducer = createReducer(
  initialSessionState,
  on(SessionActions.setPlatform, (state, { platform }) => ({
    ...state,
    platform,
  })),
  on(SessionActions.shellReady, (state, { timestamp }) => ({
    ...state,
    shellReady: true,
    shellReadyTimestamp: timestamp,
  }))
);
