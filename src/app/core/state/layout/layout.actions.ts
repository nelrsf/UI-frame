import { createAction, props } from '@ngrx/store';
import { LayoutSplittableRegionModel } from '../../../shell/models/layout-splittable-region.model';

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
 * Sets the sidebar content-panel visibility directly to the given boolean value.
 */
export const setSidebarVisible = createAction(
  '[Layout] Set Sidebar Visible',
  props<{ visible: boolean }>()
);

/**
 * Sets the bottom-panel visibility directly to the given boolean value.
 */
export const setBottomPanelVisible = createAction(
  '[Layout] Set Bottom Panel Visible',
  props<{ visible: boolean }>()
);

/**
 * Sets the secondary panel visibility directly to the given boolean value.
 */
export const setSecondaryPanelVisible = createAction(
  '[Layout] Set Secondary Panel Visible',
  props<{ visible: boolean }>()
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

/**
 * Sets the split layout state for the main content area. This is used when the user opens a file in a new split, or when they close a split and we need to update the layout accordingly.
 * Pass `null` to reset to a single non-split layout.
 */
export const setSplitLayout = createAction(
  '[Layout] Set Split Layout',
  props<{
    splitLayout: LayoutSplittableRegionModel | null;
  }>()
);


/**
 * Sets the size of a specific split pane in the main content area. The `paneId` corresponds to the `id` property of a `LayoutSplitRegion` in the current split layout state. The `size` is a number between 0 and 1 representing the percentage of available space that the pane should take up.
 * This action is typically dispatched when the user drags the divider between split panes to resize them.
 */
export const setSplitPaneSize = createAction(
  '[Layout] Set Split Pane Size',
  props<{ paneId: string; size: number }>()
);