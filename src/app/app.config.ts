import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

/**
 * Root application configuration for the Shell v1 Angular bootstrap.
 *
 * Wires:
 *   - NgRx Store with an empty initial root reducer map.  Feature slices are
 *     registered lazily via their own provideState() / loadedConfig providers.
 *   - NgRx Effects with an empty initial effects array.  Feature effects are
 *     registered alongside their feature state.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({}),
    provideEffects([]),
  ],
};
