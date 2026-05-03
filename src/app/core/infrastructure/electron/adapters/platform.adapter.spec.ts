import { PlatformAdapter } from './platform.adapter';

/**
 * Directly instantiates a `PlatformAdapter` after optionally setting up
 * a synthetic `window.electronAPI.platform` value.  Cleans up afterwards.
 */
function makeAdapter(rawPlatform?: string): PlatformAdapter {
  const win = window as unknown as Record<string, unknown>;
  if (rawPlatform !== undefined) {
    win['electronAPI'] = { platform: rawPlatform };
  } else {
    delete win['electronAPI'];
  }
  return new PlatformAdapter();
}

describe('PlatformAdapter', () => {
  afterEach(() => {
    const win = window as unknown as Record<string, unknown>;
    delete win['electronAPI'];
  });

  // ── resolvePlatform / fallback ───────────────────────────────────────────

  describe('resolvePlatform — no electronAPI (browser fallback)', () => {
    it('should fall back to linux when electronAPI is absent', () => {
      const adapter = makeAdapter();
      expect(adapter.platform).toBe('linux');
    });

    it('isLinux should be true in the fallback case', () => {
      const adapter = makeAdapter();
      expect(adapter.isLinux).toBeTrue();
    });

    it('isWindows should be false in the fallback case', () => {
      const adapter = makeAdapter();
      expect(adapter.isWindows).toBeFalse();
    });

    it('isMac should be false in the fallback case', () => {
      const adapter = makeAdapter();
      expect(adapter.isMac).toBeFalse();
    });
  });

  // ── resolvePlatform — win32 ──────────────────────────────────────────────

  describe('resolvePlatform — win32', () => {
    it('should resolve platform as win32', () => {
      const adapter = makeAdapter('win32');
      expect(adapter.platform).toBe('win32');
    });

    it('isWindows should be true', () => {
      const adapter = makeAdapter('win32');
      expect(adapter.isWindows).toBeTrue();
    });

    it('isMac should be false', () => {
      const adapter = makeAdapter('win32');
      expect(adapter.isMac).toBeFalse();
    });

    it('isLinux should be false', () => {
      const adapter = makeAdapter('win32');
      expect(adapter.isLinux).toBeFalse();
    });

    it('platformClass should be platform-win32', () => {
      const adapter = makeAdapter('win32');
      expect(adapter.platformClass).toBe('platform-win32');
    });
  });

  // ── resolvePlatform — darwin ─────────────────────────────────────────────

  describe('resolvePlatform — darwin', () => {
    it('should resolve platform as darwin', () => {
      const adapter = makeAdapter('darwin');
      expect(adapter.platform).toBe('darwin');
    });

    it('isMac should be true', () => {
      const adapter = makeAdapter('darwin');
      expect(adapter.isMac).toBeTrue();
    });

    it('isWindows should be false', () => {
      const adapter = makeAdapter('darwin');
      expect(adapter.isWindows).toBeFalse();
    });

    it('isLinux should be false', () => {
      const adapter = makeAdapter('darwin');
      expect(adapter.isLinux).toBeFalse();
    });

    it('platformClass should be platform-darwin', () => {
      const adapter = makeAdapter('darwin');
      expect(adapter.platformClass).toBe('platform-darwin');
    });
  });

  // ── resolvePlatform — linux ──────────────────────────────────────────────

  describe('resolvePlatform — linux', () => {
    it('should resolve platform as linux', () => {
      const adapter = makeAdapter('linux');
      expect(adapter.platform).toBe('linux');
    });

    it('isLinux should be true', () => {
      const adapter = makeAdapter('linux');
      expect(adapter.isLinux).toBeTrue();
    });

    it('isWindows should be false', () => {
      const adapter = makeAdapter('linux');
      expect(adapter.isWindows).toBeFalse();
    });

    it('isMac should be false', () => {
      const adapter = makeAdapter('linux');
      expect(adapter.isMac).toBeFalse();
    });

    it('platformClass should be platform-linux', () => {
      const adapter = makeAdapter('linux');
      expect(adapter.platformClass).toBe('platform-linux');
    });
  });

  // ── resolvePlatform — unknown / unrecognised values ──────────────────────

  describe('resolvePlatform — unrecognised values fall back to linux', () => {
    it('should fall back to linux for an empty string', () => {
      const adapter = makeAdapter('');
      expect(adapter.platform).toBe('linux');
    });

    it('should fall back to linux for an unrecognised platform string', () => {
      const adapter = makeAdapter('freebsd');
      expect(adapter.platform).toBe('linux');
    });
  });

  // ── platformClass getter ─────────────────────────────────────────────────

  describe('platformClass getter', () => {
    it('should prefix the resolved platform name with "platform-"', () => {
      const adapter = makeAdapter('linux');
      expect(adapter.platformClass).toBe(`platform-${adapter.platform}`);
    });
  });
});
