import { ApplicationConfig } from '@angular/core';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { sessionReducer } from './core/state/session';
import { layoutReducer } from './core/state/layout';
import { uiContextReducer } from './core/state/ui-context';
import { preferencesReducer, PreferencesEffects } from './core/state/preferences';

/**
 * Root application configuration for the Shell v1 Angular bootstrap.
 *
 * Wires:
 *   - NgRx Store with an empty initial root reducer map.  Feature slices are
 *     registered lazily via their own provideState() / loadedConfig providers.
 *   - NgRx Effects with an empty initial effects array.  Feature effects are
 *     registered alongside their feature state.
 *   - Session feature slice: records platform and shell readiness.
 *   - Layout feature slice: sidebar/panel visibility and dimensions.
 *   - UiContext feature slice: breadcrumbs, status items, available actions.
 *   - Preferences feature slice: versioned workspace preference snapshot.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({}),
    provideState('session', sessionReducer),
    provideState('layout', layoutReducer),
    provideState('uiContext', uiContextReducer),
    provideState('preferences', preferencesReducer),
    provideEffects([PreferencesEffects]),
  ],
};
