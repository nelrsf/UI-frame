import { Injectable } from '@angular/core';
import { PREFERENCES_SCHEMA_VERSION, PreferencesData, PreferencesEnvelope } from '../../../models/preferences.model';

/**
 * Low-level repository that reads and writes workspace preferences from
 * `localStorage` using a composite key of `workspaceId + schemaVersion`.
 *
 * Responsibilities:
 * - Namespace persistence per workspace.
 * - Validate the persisted envelope before returning data (schema version check).
 * - Return an empty map on any parse/validation failure (safe fallback).
 */
@Injectable({ providedIn: 'root' })
export class PreferencesRepository {
  /** Builds the composite storage key for a given workspace. */
  storageKey(workspaceId: string): string {
    return `prefs:${workspaceId}:v${PREFERENCES_SCHEMA_VERSION}`;
  }

  /**
   * Loads preferences for `workspaceId` from localStorage.
   * Returns an empty map when nothing is stored or the persisted data is
   * corrupt / from an incompatible schema version.
   */
  load(workspaceId: string): PreferencesData {
    try {
      const raw = localStorage.getItem(this.storageKey(workspaceId));
      if (raw === null) return {};

      const parsed: unknown = JSON.parse(raw);
      if (!this.isValidEnvelope(parsed, workspaceId)) return {};

      return (parsed as PreferencesEnvelope).data;
    } catch {
      return {};
    }
  }

  /**
   * Persists `data` for `workspaceId` to localStorage as a versioned envelope.
   * Silently discards failures (e.g. storage quota exceeded).
   */
  save(workspaceId: string, data: PreferencesData): void {
    try {
      const envelope: PreferencesEnvelope = {
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        workspaceId,
        data,
      };
      localStorage.setItem(this.storageKey(workspaceId), JSON.stringify(envelope));
    } catch {
      // Storage quota exceeded or unavailable — fail silently.
    }
  }

  /**
   * Removes the persisted preferences for `workspaceId` from localStorage.
   */
  clear(workspaceId: string): void {
    localStorage.removeItem(this.storageKey(workspaceId));
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private isValidEnvelope(value: unknown, workspaceId: string): boolean {
    if (typeof value !== 'object' || value === null) return false;
    const env = value as Record<string, unknown>;
    return (
      env['schemaVersion'] === PREFERENCES_SCHEMA_VERSION &&
      env['workspaceId'] === workspaceId &&
      typeof env['data'] === 'object' &&
      env['data'] !== null &&
      !Array.isArray(env['data'])
    );
  }
}
