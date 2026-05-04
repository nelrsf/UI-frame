import { ALLOWED_EXTERNAL_PROTOCOLS, IPC_CHANNELS } from './ipc/channels';

/**
 * Tests for the Electron preload bridge security contract.
 *
 * Validates the sender-side security behaviors that the preload enforces
 * before forwarding any IPC request to the main process:
 *   - External URL protocol allowlist filtering (NFR-Security-02)
 *   - Preference key validation — non-empty string guard (FR-Security)
 *   - IPC channel name contracts (FR-Security)
 *
 * No real Electron runtime is required: the validation logic is exercised
 * in isolation as pure functions that mirror the preload implementation.
 *
 * References: FR-Security, NFR-Security-01, NFR-Security-02, TS-05, TS-07
 */

// ---------------------------------------------------------------------------
// Helpers — mirror preload sender-side logic
// ---------------------------------------------------------------------------

/** Mirrors preload openExternal sender-side validation. */
function preloadOpenExternal(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_EXTERNAL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Mirrors preload preferences.get / preferences.set sender-side key guard. */
function preloadKeyIsValid(key: unknown): boolean {
  return typeof key === 'string' && key.trim() !== '';
}

// ---------------------------------------------------------------------------
// ALLOWED_EXTERNAL_PROTOCOLS contract
// ---------------------------------------------------------------------------

describe('Preload — ALLOWED_EXTERNAL_PROTOCOLS (NFR-Security-02)', () => {
  it('should include https: protocol', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).toContain('https:');
  });

  it('should include http: protocol', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).toContain('http:');
  });

  it('should not include javascript: protocol', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).not.toContain('javascript:');
  });

  it('should not include file: protocol', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).not.toContain('file:');
  });

  it('should not include ftp: protocol', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).not.toContain('ftp:');
  });

  it('should not include data: protocol', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).not.toContain('data:');
  });

  it('should contain exactly two entries', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// openExternal — sender-side URL validation
// ---------------------------------------------------------------------------

describe('Preload — openExternal sender-side validation (NFR-Security-02)', () => {
  it('should allow an https URL', () => {
    expect(preloadOpenExternal('https://example.com')).toBeTrue();
  });

  it('should allow an http URL', () => {
    expect(preloadOpenExternal('http://example.com')).toBeTrue();
  });

  it('should deny a javascript: URL', () => {
    expect(preloadOpenExternal('javascript:alert(1)')).toBeFalse();
  });

  it('should deny a file: URL', () => {
    expect(preloadOpenExternal('file:///etc/passwd')).toBeFalse();
  });

  it('should deny a data: URL', () => {
    expect(preloadOpenExternal('data:text/html,<script>alert(1)</script>')).toBeFalse();
  });

  it('should deny a ftp: URL', () => {
    expect(preloadOpenExternal('ftp://files.example.com')).toBeFalse();
  });

  it('should deny an invalid (non-parseable) URL', () => {
    expect(preloadOpenExternal('not-a-url')).toBeFalse();
  });

  it('should deny an empty string', () => {
    expect(preloadOpenExternal('')).toBeFalse();
  });

  it('should allow an https URL with a path and query string', () => {
    expect(preloadOpenExternal('https://example.com/path?q=1')).toBeTrue();
  });

  it('should deny a URL with a custom protocol similar to an allowed one', () => {
    // 'https-custom:' is not in the allowlist because exact protocol matching
    // is used — the URL constructor extracts the full protocol including the colon.
    expect(preloadOpenExternal('https-custom://example.com')).toBeFalse();
  });
});

// ---------------------------------------------------------------------------
// preferences — sender-side key validation
// ---------------------------------------------------------------------------

describe('Preload — preferences key validation (FR-Security)', () => {
  it('should accept a non-empty string key', () => {
    expect(preloadKeyIsValid('theme')).toBeTrue();
  });

  it('should accept a dotted namespace key', () => {
    expect(preloadKeyIsValid('editor.fontSize')).toBeTrue();
  });

  it('should reject an empty string key', () => {
    expect(preloadKeyIsValid('')).toBeFalse();
  });

  it('should reject a whitespace-only key', () => {
    expect(preloadKeyIsValid('   ')).toBeFalse();
  });

  it('should reject a numeric key', () => {
    expect(preloadKeyIsValid(42)).toBeFalse();
  });

  it('should reject null', () => {
    expect(preloadKeyIsValid(null)).toBeFalse();
  });

  it('should reject undefined', () => {
    expect(preloadKeyIsValid(undefined)).toBeFalse();
  });

  it('should reject an object', () => {
    expect(preloadKeyIsValid({ key: 'theme' })).toBeFalse();
  });

  it('should reject an array', () => {
    expect(preloadKeyIsValid(['theme'])).toBeFalse();
  });
});

// ---------------------------------------------------------------------------
// IPC channel name contracts
// ---------------------------------------------------------------------------

describe('Preload — IPC channel name contracts (FR-Security)', () => {
  it('should expose window:minimize channel', () => {
    expect(IPC_CHANNELS.WINDOW.MINIMIZE).toBe('window:minimize');
  });

  it('should expose window:maximize channel', () => {
    expect(IPC_CHANNELS.WINDOW.MAXIMIZE).toBe('window:maximize');
  });

  it('should expose window:close channel', () => {
    expect(IPC_CHANNELS.WINDOW.CLOSE).toBe('window:close');
  });

  it('should expose window:isMaximized channel', () => {
    expect(IPC_CHANNELS.WINDOW.IS_MAXIMIZED).toBe('window:isMaximized');
  });

  it('should expose shell:openExternal channel', () => {
    expect(IPC_CHANNELS.SHELL.OPEN_EXTERNAL).toBe('shell:openExternal');
  });

  it('should expose preferences:get channel', () => {
    expect(IPC_CHANNELS.PREFERENCES.GET).toBe('preferences:get');
  });

  it('should expose preferences:set channel', () => {
    expect(IPC_CHANNELS.PREFERENCES.SET).toBe('preferences:set');
  });

  it('should have unique channel names across all namespaces', () => {
    const all = [
      IPC_CHANNELS.WINDOW.MINIMIZE,
      IPC_CHANNELS.WINDOW.MAXIMIZE,
      IPC_CHANNELS.WINDOW.CLOSE,
      IPC_CHANNELS.WINDOW.IS_MAXIMIZED,
      IPC_CHANNELS.SHELL.OPEN_EXTERNAL,
      IPC_CHANNELS.PREFERENCES.GET,
      IPC_CHANNELS.PREFERENCES.SET,
    ];
    expect(new Set(all).size).toBe(all.length);
  });
});
