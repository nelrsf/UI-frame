import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  WorkspaceSession,
  WORKSPACE_SESSION_SCHEMA_VERSION,
} from '../models/workspace-session.model';

/** Storage key prefix for workspace session snapshots. */
const SESSION_STORAGE_PREFIX = 'workspace-session';

export interface IWorkspaceSessionService {
  /** Stream that emits the currently active session snapshot, or `null` when none is loaded. */
  readonly session$: Observable<WorkspaceSession | null>;
  /** The currently active session snapshot, or `null` when none is loaded. */
  readonly currentSession: WorkspaceSession | null;
  /**
   * Persists `session` to local storage and emits it on `session$`.
   * Uses the session's `workspaceId` as the storage scope.
   */
  save(session: WorkspaceSession): void;
  /**
   * Attempts to load a previously saved session for `workspaceId`.
   * Returns `null` — and emits `null` on `session$` — when no valid snapshot
   * exists or the stored snapshot is corrupt / schema-incompatible.
   */
  restore(workspaceId: string): WorkspaceSession | null;
  /**
   * Removes the persisted session snapshot for `workspaceId` from local storage
   * and emits `null` on `session$` when the cleared workspace matches the
   * currently active session.
   */
  clear(workspaceId: string): void;
}

/**
 * Orchestrates restorable workspace session state for Shell v1.
 *
 * Responsibilities:
 * - Persist a `WorkspaceSession` snapshot to `localStorage` under a namespaced key.
 * - Restore a previously saved snapshot with safe fallback on invalid data.
 * - Expose the active session as a reactive `session$` stream.
 *
 * Persistence guarantees (v1):
 * - Storage key is namespaced by `workspaceId` and `schemaVersion`.
 * - Corrupt or schema-incompatible snapshots are silently discarded and `null` is
 *   returned so callers can fall back to safe defaults.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceSessionService implements IWorkspaceSessionService {
  private readonly _session$ = new BehaviorSubject<WorkspaceSession | null>(null);

  /** Stream that emits the currently active session snapshot, or `null` when none is loaded. */
  readonly session$: Observable<WorkspaceSession | null> = this._session$.asObservable();

  /** The currently active session snapshot, or `null` when none is loaded. */
  get currentSession(): WorkspaceSession | null {
    return this._session$.getValue();
  }

  /**
   * Persists `session` to `localStorage` as a versioned snapshot and emits it
   * on `session$`. The snapshot's `savedAt` field is set to the current ISO
   * timestamp so the envelope always reflects the actual save time.
   */
  save(session: WorkspaceSession): void {
    const snapshot: WorkspaceSession = {
      ...session,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(this.storageKey(session.workspaceId), JSON.stringify(snapshot));
    } catch {
      // Storage quota exceeded or unavailable — fail silently.
    }
    this._session$.next(snapshot);
  }

  /**
   * Loads and validates the persisted session snapshot for `workspaceId`.
   * Emits the loaded snapshot on `session$` on success.
   * Returns `null` and emits `null` on `session$` when nothing is stored or
   * the stored data is corrupt or schema-incompatible.
   */
  restore(workspaceId: string): WorkspaceSession | null {
    try {
      const raw = localStorage.getItem(this.storageKey(workspaceId));
      if (raw === null) {
        this._session$.next(null);
        return null;
      }

      const parsed: unknown = JSON.parse(raw);
      if (!this.isValidSession(parsed, workspaceId)) {
        this._session$.next(null);
        return null;
      }

      const session = parsed as WorkspaceSession;
      this._session$.next(session);
      return session;
    } catch {
      this._session$.next(null);
      return null;
    }
  }

  /**
   * Removes the persisted snapshot for `workspaceId` from `localStorage`.
   * When the cleared workspace matches the currently active session, `null`
   * is emitted on `session$`.
   */
  clear(workspaceId: string): void {
    localStorage.removeItem(this.storageKey(workspaceId));
    if (this._session$.getValue()?.workspaceId === workspaceId) {
      this._session$.next(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Builds the namespaced `localStorage` key for a given workspace.
   * Exposed for testing purposes.
   */
  storageKey(workspaceId: string): string {
    return `${SESSION_STORAGE_PREFIX}:${workspaceId}:v${WORKSPACE_SESSION_SCHEMA_VERSION}`;
  }

  private isValidSession(value: unknown, workspaceId: string): boolean {
    if (typeof value !== 'object' || value === null) return false;
    const s = value as Record<string, unknown>;
    return (
      s['schemaVersion'] === WORKSPACE_SESSION_SCHEMA_VERSION &&
      s['workspaceId'] === workspaceId &&
      typeof s['savedAt'] === 'string' &&
      Array.isArray(s['zoneAssignments']) &&
      typeof s['activeTabPerZone'] === 'object' &&
      s['activeTabPerZone'] !== null &&
      Array.isArray(s['tabs']) &&
      typeof s['dimensions'] === 'object' &&
      s['dimensions'] !== null
    );
  }
}
