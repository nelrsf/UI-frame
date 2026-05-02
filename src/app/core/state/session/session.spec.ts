import { sessionReducer, initialSessionState, SessionState } from './session.reducer';
import { setPlatform, shellReady, setWindowMaximized } from './session.actions';
import {
  selectPlatform,
  selectShellReady,
  selectShellReadyTimestamp,
  selectWindowMaximized,
} from './session.selectors';

describe('session reducer', () => {
  it('should return the initial state for unknown actions', () => {
    const state = sessionReducer(undefined, { type: '__unknown__' });
    expect(state).toEqual(initialSessionState);
  });

  describe('setPlatform', () => {
    it('should update the platform to win32', () => {
      const state = sessionReducer(initialSessionState, setPlatform({ platform: 'win32' }));
      expect(state.platform).toBe('win32');
    });

    it('should update the platform to darwin', () => {
      const state = sessionReducer(initialSessionState, setPlatform({ platform: 'darwin' }));
      expect(state.platform).toBe('darwin');
    });

    it('should update the platform to linux', () => {
      const state = sessionReducer(initialSessionState, setPlatform({ platform: 'linux' }));
      expect(state.platform).toBe('linux');
    });

    it('should not mutate shellReady when setting platform', () => {
      const state = sessionReducer(initialSessionState, setPlatform({ platform: 'darwin' }));
      expect(state.shellReady).toBeFalse();
      expect(state.shellReadyTimestamp).toBeNull();
    });
  });

  describe('shellReady', () => {
    it('should set shellReady to true', () => {
      const state = sessionReducer(initialSessionState, shellReady({ timestamp: 1000 }));
      expect(state.shellReady).toBeTrue();
    });

    it('should record the timestamp', () => {
      const ts = 1_700_000_000_000;
      const state = sessionReducer(initialSessionState, shellReady({ timestamp: ts }));
      expect(state.shellReadyTimestamp).toBe(ts);
    });

    it('should not mutate platform when shell becomes ready', () => {
      const withPlatform = sessionReducer(initialSessionState, setPlatform({ platform: 'win32' }));
      const withReady = sessionReducer(withPlatform, shellReady({ timestamp: 42 }));
      expect(withReady.platform).toBe('win32');
    });
  });

  describe('setWindowMaximized', () => {
    it('should set windowMaximized to true', () => {
      const state = sessionReducer(initialSessionState, setWindowMaximized({ maximized: true }));
      expect(state.windowMaximized).toBeTrue();
    });

    it('should set windowMaximized to false', () => {
      const maximized = { ...initialSessionState, windowMaximized: true };
      const state = sessionReducer(maximized, setWindowMaximized({ maximized: false }));
      expect(state.windowMaximized).toBeFalse();
    });

    it('should not affect platform or shellReady when setting windowMaximized', () => {
      const state = sessionReducer(initialSessionState, setWindowMaximized({ maximized: true }));
      expect(state.platform).toBe('linux');
      expect(state.shellReady).toBeFalse();
    });
  });
});

describe('session selectors', () => {
  const state: { session: SessionState } = {
    session: {
      platform: 'darwin',
      shellReady: true,
      shellReadyTimestamp: 9999,
      windowMaximized: true,
    },
  };

  it('selectPlatform should return the platform', () => {
    expect(selectPlatform(state)).toBe('darwin');
  });

  it('selectShellReady should return shellReady flag', () => {
    expect(selectShellReady(state)).toBeTrue();
  });

  it('selectShellReadyTimestamp should return the timestamp', () => {
    expect(selectShellReadyTimestamp(state)).toBe(9999);
  });

  it('selectWindowMaximized should return the windowMaximized flag', () => {
    expect(selectWindowMaximized(state)).toBeTrue();
  });
});
