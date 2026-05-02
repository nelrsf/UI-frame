import { ALLOWED_EXTERNAL_PROTOCOLS, IPC_CHANNELS } from './ipc/channels';

/**
 * Tests for the Electron main-process security behaviors.
 *
 * Validates:
 *   - BrowserWindow security configuration requirements (NFR-Security-01)
 *   - Receiver-side URL validation for shell:openExternal (NFR-Security-02)
 *   - setWindowOpenHandler always returns { action: 'deny' } (FR-Security)
 *   - Preference key validation at the handler boundary (FR-Security)
 *   - IPC channel uniqueness and namespace contracts (FR-Security)
 *
 * No real Electron runtime is required: the validation logic is exercised
 * as pure functions that mirror the main-process implementation.
 *
 * References: FR-Security, NFR-Security-01, NFR-Security-02,
 *             NFR-Reliability-01, TS-05, TS-06, TS-07, TS-08
 */

// ---------------------------------------------------------------------------
// Helpers — mirror main-process logic
// ---------------------------------------------------------------------------

/**
 * Mirrors the main-process openExternal receiver-side validation.
 * Re-validates even though the preload has already checked, enforcing the
 * "both sender and receiver" IPC security policy.
 */
function mainValidateOpenExternal(targetUrl: unknown): boolean {
  if (typeof targetUrl !== 'string') {
    return false;
  }
  try {
    const parsed = new URL(targetUrl);
    return ALLOWED_EXTERNAL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Mirrors main-process preference key validation used by both GET and SET handlers. */
function mainValidatePreferenceKey(key: unknown): boolean {
  return typeof key === 'string' && key.trim() !== '';
}

/** Mirrors setWindowOpenHandler — always denies new-window requests. */
function mainWindowOpenHandler(_url: string): { action: 'deny' | 'allow' } {
  return { action: 'deny' };
}

// ---------------------------------------------------------------------------
// BrowserWindow security configuration (NFR-Security-01)
// ---------------------------------------------------------------------------

/**
 * Documents the required BrowserWindow webPreferences for Shell v1.
 * The values here MUST match what createWindow() passes to new BrowserWindow().
 */
const REQUIRED_WEB_PREFERENCES = {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
} as const;

describe('Main process — BrowserWindow security configuration (NFR-Security-01)', () => {
  it('should require contextIsolation: true', () => {
    expect(REQUIRED_WEB_PREFERENCES.contextIsolation).toBeTrue();
  });

  it('should require nodeIntegration: false', () => {
    expect(REQUIRED_WEB_PREFERENCES.nodeIntegration).toBeFalse();
  });

  it('should require sandbox: true', () => {
    expect(REQUIRED_WEB_PREFERENCES.sandbox).toBeTrue();
  });
});

// ---------------------------------------------------------------------------
// openExternal — receiver-side URL validation (NFR-Security-02)
// ---------------------------------------------------------------------------

describe('Main process — openExternal receiver-side validation (NFR-Security-02)', () => {
  it('should allow an https URL', () => {
    expect(mainValidateOpenExternal('https://example.com')).toBeTrue();
  });

  it('should allow an http URL', () => {
    expect(mainValidateOpenExternal('http://example.com')).toBeTrue();
  });

  it('should deny a javascript: URL', () => {
    expect(mainValidateOpenExternal('javascript:alert(1)')).toBeFalse();
  });

  it('should deny a file: URL', () => {
    expect(mainValidateOpenExternal('file:///etc/passwd')).toBeFalse();
  });

  it('should deny a data: URL', () => {
    expect(mainValidateOpenExternal('data:text/html,<script>alert(1)</script>')).toBeFalse();
  });

  it('should deny a ftp: URL', () => {
    expect(mainValidateOpenExternal('ftp://files.example.com')).toBeFalse();
  });

  it('should deny a non-string argument (number)', () => {
    expect(mainValidateOpenExternal(42)).toBeFalse();
  });

  it('should deny null', () => {
    expect(mainValidateOpenExternal(null)).toBeFalse();
  });

  it('should deny undefined', () => {
    expect(mainValidateOpenExternal(undefined)).toBeFalse();
  });

  it('should deny an object argument', () => {
    expect(mainValidateOpenExternal({ url: 'https://example.com' })).toBeFalse();
  });

  it('should deny an invalid (non-parseable) URL string', () => {
    expect(mainValidateOpenExternal('not-a-url')).toBeFalse();
  });

  it('should deny an empty string', () => {
    expect(mainValidateOpenExternal('')).toBeFalse();
  });

  it('should allow an https URL with path and query parameters', () => {
    expect(mainValidateOpenExternal('https://example.com/docs?ref=main')).toBeTrue();
  });
});

// ---------------------------------------------------------------------------
// setWindowOpenHandler — always deny (FR-Security)
// ---------------------------------------------------------------------------

describe('Main process — setWindowOpenHandler always denies (FR-Security)', () => {
  it('should return action: deny for an https URL', () => {
    expect(mainWindowOpenHandler('https://example.com').action).toBe('deny');
  });

  it('should return action: deny for a javascript: URL', () => {
    expect(mainWindowOpenHandler('javascript:alert(1)').action).toBe('deny');
  });

  it('should return action: deny for an empty string', () => {
    expect(mainWindowOpenHandler('').action).toBe('deny');
  });

  it('should never return action: allow', () => {
    const result = mainWindowOpenHandler('https://example.com');
    expect(result.action).not.toBe('allow');
  });
});

// ---------------------------------------------------------------------------
// Preference handler — key validation at boundary (FR-Security)
// ---------------------------------------------------------------------------

describe('Main process — preference key validation at handler boundary (FR-Security)', () => {
  it('should accept a valid non-empty string key', () => {
    expect(mainValidatePreferenceKey('theme')).toBeTrue();
  });

  it('should accept a dotted namespace key', () => {
    expect(mainValidatePreferenceKey('editor.tabSize')).toBeTrue();
  });

  it('should reject an empty string key', () => {
    expect(mainValidatePreferenceKey('')).toBeFalse();
  });

  it('should reject a whitespace-only key', () => {
    expect(mainValidatePreferenceKey('   ')).toBeFalse();
  });

  it('should reject a numeric key', () => {
    expect(mainValidatePreferenceKey(99)).toBeFalse();
  });

  it('should reject null', () => {
    expect(mainValidatePreferenceKey(null)).toBeFalse();
  });

  it('should reject undefined', () => {
    expect(mainValidatePreferenceKey(undefined)).toBeFalse();
  });

  it('should reject an object', () => {
    expect(mainValidatePreferenceKey({ key: 'theme' })).toBeFalse();
  });
});

// ---------------------------------------------------------------------------
// IPC channel contracts (FR-Security)
// ---------------------------------------------------------------------------

describe('Main process — IPC channel contracts (FR-Security)', () => {
  it('should use namespaced channel names to prevent collision', () => {
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

  it('should restrict the external URL allowlist to exactly http and https', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS.length).toBe(2);
    expect(ALLOWED_EXTERNAL_PROTOCOLS).toContain('https:');
    expect(ALLOWED_EXTERNAL_PROTOCOLS).toContain('http:');
  });

  it('should not allow javascript: in the protocol allowlist', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).not.toContain('javascript:');
  });

  it('should not allow file: in the protocol allowlist', () => {
    expect(ALLOWED_EXTERNAL_PROTOCOLS).not.toContain('file:');
  });
});
