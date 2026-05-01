import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PreferencesData } from '../models/preferences.model';
import { PreferencesRepository } from '../infrastructure/persistence/local-storage/preferences.repository';
import { resolveWorkspaceId } from '../utils/workspace-id.util';

export interface IUserPreferencesService {
  readonly workspaceId: string;
  /** Resolves the canonical workspace ID from a raw path and initializes the workspace. */
  initWorkspaceFromPath(rawPath?: string | null): Promise<void>;
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
  reset(key?: string): void;
  readonly preferences$: Observable<Record<string, unknown>>;
}

/**
 * Manages user preferences scoped to a specific workspace.
 *
 * Usage:
 * 1. Call `initWorkspace(workspaceId)` once the active workspace is known.
 * 2. Use `get` / `set` / `reset` to read and write individual keys.
 * 3. Subscribe to `preferences$` to react to any change.
 *
 * Persistence guarantees (v1):
 * - Storage key is namespaced by workspaceId and schemaVersion.
 * - Corrupt or incompatible persisted data is silently discarded; defaults apply.
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesService implements IUserPreferencesService {
  private _workspaceId = '';
  private _data: PreferencesData = {};
  private readonly _preferences$ = new BehaviorSubject<PreferencesData>({});

  /** Current active workspace identifier. Empty string until initialized. */
  get workspaceId(): string {
    return this._workspaceId;
  }

  /** Stream that emits the full preferences map whenever any key changes. */
  readonly preferences$: Observable<Record<string, unknown>> = this._preferences$.asObservable();

  constructor(private readonly repository: PreferencesRepository) {}

  /**
   * Loads persisted preferences for `workspaceId` and sets it as the active
   * workspace context.  Call this whenever the active project/workspace changes.
   */
  initWorkspace(workspaceId: string): void {
    this._workspaceId = workspaceId;
    this._data = this.repository.load(workspaceId);
    this._preferences$.next({ ...this._data });
  }

  /**
   * Resolves the canonical workspace ID from `rawPath` using the Shell v1
   * identity algorithm and then initializes the workspace.
   *
   * - When `rawPath` is absent, empty, or `null` the stable fallback identifier
   *   `ws-default` is used (spec §Workspace Identity closed decision).
   * - Otherwise the path is normalized and `ws-<16 hex chars>` is derived from
   *   its SHA-256 hash before initializing.
   */
  async initWorkspaceFromPath(rawPath?: string | null): Promise<void> {
    const workspaceId = await resolveWorkspaceId(rawPath);
    this.initWorkspace(workspaceId);
  }

  /**
   * Returns the value for `key`, or `defaultValue` when the key is absent,
   * `undefined`, or `null`.
   */
  get<T>(key: string, defaultValue: T): T {
    const value = this._data[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return value as T;
  }

  /**
   * Stores `value` for `key` and persists the updated map.
   */
  set<T>(key: string, value: T): void {
    this._data = { ...this._data, [key]: value };
    this.persist();
  }

  /**
   * Clears a single `key` when provided, or resets **all** preferences when
   * called without arguments. Persists the result.
   */
  reset(key?: string): void {
    if (key !== undefined) {
      const { [key]: _removed, ...rest } = this._data;
      this._data = rest;
    } else {
      this._data = {};
      if (this._workspaceId) {
        this.repository.clear(this._workspaceId);
      }
    }
    this.persist();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private persist(): void {
    if (this._workspaceId) {
      this.repository.save(this._workspaceId, this._data);
    }
    this._preferences$.next({ ...this._data });
  }
}
