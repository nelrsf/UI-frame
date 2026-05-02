import { SessionState } from './session/session.reducer';
import { LayoutState } from './layout/layout.reducer';
import { UiContextState } from './ui-context/ui-context.reducer';
import { PreferencesState } from './preferences/preferences.reducer';

/**
 * AppState defines the root NgRx state shape for the Shell v1 application.
 *
 * Only transversal shell concerns are represented here.
 * Component-local interaction state must remain in the owning component.
 *
 * Slice boundaries (per speckit.plan.md §3):
 *   - layout    : sidebar/panel visibility, widths, heights, active sidebar item.
 *   - workspace : open tabs, active tab, dirty/pinned metadata per tab group.
 *   - session   : platform, window-maximized flag, shell readiness.
 *   - uiContext : breadcrumbs, available actions, status-bar items.
 *   - preferences: versioned user-preference snapshot, isolated per workspace.
 *
 * Feature slices are registered lazily via their own feature state descriptors
 * and are NOT inlined here; this interface acts only as the root type contract.
 */
export interface AppState {
  // Registered in app.config.ts via provideState('layout', layoutReducer).
  readonly layout?: LayoutState;
  // Populated once the workspace feature slice is registered (T-future).
  readonly workspace?: unknown;
  // Registered in app.config.ts via provideState('session', sessionReducer).
  readonly session?: SessionState;
  // Registered in app.config.ts via provideState('uiContext', uiContextReducer).
  readonly uiContext?: UiContextState;
  // Registered in app.config.ts via provideState('preferences', preferencesReducer).
  readonly preferences?: PreferencesState;
}
