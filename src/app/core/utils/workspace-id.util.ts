/**
 * Workspace identity utilities for Shell v1.
 *
 * Closed Decision (spec §Workspace Identity):
 * - The canonical workspaceId is derived from the normalized absolute workspace root path.
 * - Normalization: resolve symlinks when available, trim trailing separators,
 *   use forward slashes internally, lowercase the drive letter on Windows.
 * - Algorithm: `ws-` + first 16 hex characters of the SHA-256 hash of the
 *   normalized workspace root string.
 * - Fallback: when no workspace root is known, use the sentinel root
 *   `app://default-workspace` and the stable identifier `ws-default`.
 */

/** Sentinel root used when no real workspace root is available. */
export const DEFAULT_WORKSPACE_SENTINEL = 'app://default-workspace';

/** Stable fallback workspace identifier when no workspace root is set. */
export const FALLBACK_WORKSPACE_ID = 'ws-default';

/** Number of leading hex characters taken from the SHA-256 digest. */
const ID_HASH_PREFIX_LENGTH = 16;

/**
 * Normalizes a raw workspace root path according to Shell v1 identity rules:
 * - Converts backslashes to forward slashes.
 * - Lowercases the drive letter on Windows paths (e.g. `C:/` → `c:/`).
 * - Trims trailing path separators.
 *
 * Symlink resolution is the caller's responsibility when the path originates
 * from the file system; this function performs only string-level normalization.
 */
export function normalizeWorkspaceRoot(rawPath: string): string {
  // Replace all backslashes with forward slashes
  let normalized = rawPath.replace(/\\/g, '/');

  // Lowercase the drive letter on Windows paths (e.g. C:/ → c:/)
  normalized = normalized.replace(/^([A-Za-z]):/, (_, drive: string) => `${drive.toLowerCase()}:`);

  // Trim all trailing forward slashes
  normalized = normalized.replace(/\/+$/, '');

  return normalized;
}

/**
 * Generates a workspace ID from a **normalized** workspace root string.
 *
 * Returns a string of the form `ws-<16 hex chars>` derived from the SHA-256
 * hash of the normalized root.
 *
 * The function is async because it delegates hashing to the Web Crypto API
 * (`crypto.subtle.digest`), which is available in both browser and Electron
 * renderer contexts.
 */
export async function generateWorkspaceId(normalizedRoot: string): Promise<string> {
  const encoded = new TextEncoder().encode(normalizedRoot);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  return `ws-${hashHex.slice(0, ID_HASH_PREFIX_LENGTH)}`;
}

/**
 * Resolves the effective workspace ID for a given raw workspace root path.
 *
 * - Returns `ws-default` when `rawPath` is absent, empty, or `null`.
 * - Otherwise normalizes the path and returns `ws-<16 hex chars>` derived
 *   from its SHA-256 hash.
 */
export async function resolveWorkspaceId(rawPath?: string | null): Promise<string> {
  if (!rawPath) {
    return FALLBACK_WORKSPACE_ID;
  }
  const normalized = normalizeWorkspaceRoot(rawPath);
  return generateWorkspaceId(normalized);
}
