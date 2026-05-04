import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { sessionReducer } from './core/state/session';
import { layoutReducer } from './core/state/layout';
import { uiContextReducer } from './core/state/ui-context';
import { preferencesReducer, PreferencesEffects } from './core/state/preferences';
import { workspaceReducer } from './core/state/workspace';
import { shellContentReducer } from './core/state/shell-content';
import { ShellManager } from './shell/shell-manager.service';
import { registerMockContent } from './shell/mock-ui/mock-content.initializer';

function initializeShellContent(shell: ShellManager): () => void {
  return () => registerMockContent(shell);
}

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
 *   - Workspace feature slice: tab groups, active tabs, dirty/pinned state.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // shellContent stores Angular component types (Type<unknown>) for dynamic rendering.
    // NgRx dev runtime freeze checks make these constructors non-extensible and break NgComponentOutlet.
    provideStore({}, {
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictStateSerializability: false,
        strictActionSerializability: false,
      },
    }),
    provideState('session', sessionReducer),
    provideState('layout', layoutReducer),
    provideState('uiContext', uiContextReducer),
    provideState('preferences', preferencesReducer),
    provideState('workspace', workspaceReducer),
    provideState('shellContent', shellContentReducer),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeShellContent,
      deps: [ShellManager],
      multi: true,
    },
    provideEffects([PreferencesEffects]),
  ],
};
