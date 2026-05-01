import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as PreferencesActions from './preferences.actions';
import { selectPreferencesState } from './preferences.selectors';
import { PreferencesAdapter } from '../../infrastructure/electron/adapters/preferences.adapter';

/**
 * Coordinates async persistence of workspace preferences through the Electron
 * IPC bridge (via PreferencesAdapter).
 *
 * The workspace ID is used as the storage key so each workspace has its own
 * isolated preference blob inside the main-process `preferences.json` envelope.
 */
@Injectable()
export class PreferencesEffects {
  private readonly actions$ = inject(Actions);
  private readonly adapter = inject(PreferencesAdapter);
  private readonly store = inject(Store);

  /**
   * Loads the full preferences blob for the workspace identified by
   * `workspaceId`.  On success, dispatches `loadPreferencesSuccess` with the
   * loaded data map.  On IPC failure, dispatches `loadPreferencesFailure` so
   * the reducer can fall back to an empty safe state.
   */
  loadPreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.loadPreferences),
      switchMap(({ workspaceId }) =>
        from(
          this.adapter.get<Record<string, unknown>>(workspaceId, {})
        ).pipe(
          map((data) =>
            PreferencesActions.loadPreferencesSuccess({ workspaceId, data })
          ),
          catchError((error: unknown) =>
            of(
              PreferencesActions.loadPreferencesFailure({
                workspaceId,
                error: error instanceof Error ? error.message : String(error),
              })
            )
          )
        )
      )
    )
  );

  /**
   * Persists a single preference key by merging it into the current in-memory
   * snapshot and writing the full blob back through the IPC bridge.
   *
   * Write errors are silently swallowed: `setPreferenceSuccess` is dispatched
   * regardless so the in-memory store state stays consistent even when the
   * IPC bridge is unavailable (e.g. running in browser dev mode).
   */
  setPreference$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.setPreference),
      withLatestFrom(this.store.select(selectPreferencesState)),
      switchMap(([action, state]) => {
        const updatedData: Record<string, unknown> = {
          ...state.data,
          [action.key]: action.value,
        };
        return from(this.adapter.set(state.workspaceId, updatedData)).pipe(
          map(() =>
            PreferencesActions.setPreferenceSuccess({
              key: action.key,
              value: action.value,
            })
          ),
          catchError(() =>
            of(
              PreferencesActions.setPreferenceSuccess({
                key: action.key,
                value: action.value,
              })
            )
          )
        );
      })
    )
  );
}
