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

/**
 * Toggles the secondary right-side panel visibility (show ↔ hide).
 */
export const toggleSecondaryPanel = createAction('[Layout] Toggle Secondary Panel');

/**
 * Sets the secondary panel width, clamped to
 * [SECONDARY_PANEL_WIDTH_MIN, SECONDARY_PANEL_WIDTH_MAX].
 */
export const setSecondaryPanelWidth = createAction(
  '[Layout] Set Secondary Panel Width',
  props<{ width: number }>()
);

/**
 * Restores the full layout state from a persisted workspace session.
 * All dimension values are clamped to their configured min/max bounds.
 * Dispatched once during shell initialisation when a valid session is found.
 */
export const restoreLayout = createAction(
  '[Layout] Restore Layout',
  props<{
    sidebarVisible: boolean;
    sidebarWidth: number;
    bottomPanelVisible: boolean;
    bottomPanelHeight: number;
    secondaryPanelVisible: boolean;
    secondaryPanelWidth: number;
  }>()
);
