import { createReducer, on } from '@ngrx/store';
import * as LayoutActions from './layout.actions';

/** Minimum allowed sidebar content-panel width in pixels. */
export const SIDEBAR_WIDTH_MIN = 160;
/** Maximum allowed sidebar content-panel width in pixels. */
export const SIDEBAR_WIDTH_MAX = 400;
/** Default sidebar content-panel width in pixels. */
export const SIDEBAR_WIDTH_DEFAULT = 240;

/** Minimum allowed bottom-panel height in pixels. */
export const BOTTOM_PANEL_HEIGHT_MIN = 100;
/** Maximum allowed bottom-panel height in pixels. */
export const BOTTOM_PANEL_HEIGHT_MAX = 600;
/** Default bottom-panel height in pixels. */
export const BOTTOM_PANEL_HEIGHT_DEFAULT = 200;

export interface LayoutState {
  /** Whether the sidebar content-panel is currently visible. */
  readonly sidebarVisible: boolean;
  /** Current sidebar content-panel width in pixels (clamped to [SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX]). */
  readonly sidebarWidth: number;
  /** Whether the bottom panel is currently visible. */
  readonly bottomPanelVisible: boolean;
  /** Current bottom-panel height in pixels (clamped to [BOTTOM_PANEL_HEIGHT_MIN, BOTTOM_PANEL_HEIGHT_MAX]). */
  readonly bottomPanelHeight: number;
  /** The ID of the currently active sidebar item, or null when none is active. */
  readonly activeSidebarItem: string | null;
}

export const initialLayoutState: LayoutState = {
  sidebarVisible: true,
  sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
  bottomPanelVisible: false,
  bottomPanelHeight: BOTTOM_PANEL_HEIGHT_DEFAULT,
  activeSidebarItem: null,
};

export const layoutReducer = createReducer(
  initialLayoutState,
  on(LayoutActions.toggleSidebar, (state) => ({
    ...state,
    sidebarVisible: !state.sidebarVisible,
  })),
  on(LayoutActions.setSidebarWidth, (state, { width }) => ({
    ...state,
    sidebarWidth: Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, width)),
  })),
  on(LayoutActions.toggleBottomPanel, (state) => ({
    ...state,
    bottomPanelVisible: !state.bottomPanelVisible,
  })),
  on(LayoutActions.setBottomPanelHeight, (state, { height }) => ({
    ...state,
    bottomPanelHeight: Math.min(BOTTOM_PANEL_HEIGHT_MAX, Math.max(BOTTOM_PANEL_HEIGHT_MIN, height)),
  })),
  on(LayoutActions.setActiveSidebarItem, (state, { itemId }) => ({
    ...state,
    activeSidebarItem: itemId,
  }))
);
