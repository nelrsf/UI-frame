import { createAction, props } from '@ngrx/store';

/**
 * Toggles the sidebar content-panel visibility (show ↔ hide).
 * The activity bar remains visible at all times regardless of this state.
 */
export const toggleSidebar = createAction('[Layout] Toggle Sidebar');

/**
 * Sets the sidebar content-panel width, clamped to [SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX].
 */
export const setSidebarWidth = createAction(
  '[Layout] Set Sidebar Width',
  props<{ width: number }>()
);

/**
 * Toggles the bottom-panel visibility (show ↔ hide).
 */
export const toggleBottomPanel = createAction('[Layout] Toggle Bottom Panel');

/**
 * Sets the bottom-panel height, clamped to [BOTTOM_PANEL_HEIGHT_MIN, BOTTOM_PANEL_HEIGHT_MAX].
 */
export const setBottomPanelHeight = createAction(
  '[Layout] Set Bottom Panel Height',
  props<{ height: number }>()
);

/**
 * Sets the active sidebar item (e.g. "explorer", "search", "scm").
 * Pass `null` to deactivate the current item without collapsing the sidebar.
 */
export const setActiveSidebarItem = createAction(
  '[Layout] Set Active Sidebar Item',
  props<{ itemId: string | null }>()
);
