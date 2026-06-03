import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { openTab, registerAndOpenTab, registerTab } from "./workspace.actions";
import { map, of, switchMap } from "rxjs";


@Injectable()
export class WorkspaceEffects {
    private readonly actions$ = inject(Actions);

registerAndOpenTab$ = createEffect(() =>
    this.actions$.pipe(
      ofType(registerAndOpenTab),
      switchMap(({ tab, zone }) => [
        registerTab({tab}),
        openTab({tab, zone})
      ])
    )
  );
}