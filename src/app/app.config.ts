import { ApplicationConfig } from '@angular/core';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { sessionReducer } from './core/state/session';

/**
 * Root application configuration for the Shell v1 Angular bootstrap.
 *
 * Wires:
 *   - NgRx Store with an empty initial root reducer map.  Feature slices are
 *     registered lazily via their own provideState() / loadedConfig providers.
 *   - NgRx Effects with an empty initial effects array.  Feature effects are
 *     registered alongside their feature state.
 *   - Session feature slice: records platform and shell readiness.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({}),
    provideState('session', sessionReducer),
    provideEffects([]),
  ],
};
