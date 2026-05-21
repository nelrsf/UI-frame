import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { delay, map, tap } from 'rxjs';
import * as StatusBarActions from './status-bar.actions';

@Injectable()
export class StatusBarEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  clearErrorAfterTimeout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StatusBarActions.setCallbackError),
      delay(3000),
      map(({ itemId }) => StatusBarActions.clearCallbackError({ itemId }))
    )
  );
}
