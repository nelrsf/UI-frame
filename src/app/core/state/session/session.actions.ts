import { createAction, props } from '@ngrx/store';
import { PlatformName } from '../../application/ports/platform.port';

/**
 * Dispatched during shell bootstrap to record the detected OS platform
 * in the transversal session slice.
 */
export const setPlatform = createAction(
  '[Session] Set Platform',
  props<{ platform: PlatformName }>()
);

/**
 * Dispatched once from ShellComponent.ngAfterViewInit when the shell view
 * is fully initialised and ready to accept user interaction.
 */
export const shellReady = createAction(
  '[Session] Shell Ready',
  props<{ timestamp: number }>()
);
