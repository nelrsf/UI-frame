import { createReducer, on } from '@ngrx/store';
import * as LayoutActions from './layout.actions';
import { LayoutSplittableRegionModel } from '../../../shell/models/layout-splittable-region.model';
import { DockZone } from '../../models/dock-zone-assignment.model';

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

/** Minimum allowed secondary panel width in pixels. */
export const SECONDARY_PANEL_WIDTH_MIN = 200;
/** Maximum allowed secondary panel width in pixels. */
export const SECONDARY_PANEL_WIDTH_MAX = 500;
/** Default secondary panel width in pixels. */
export const SECONDARY_PANEL_WIDTH_DEFAULT = 300;

export interface ZoneDimensionState {
  zone: DockZone;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

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
  /** Whether the secondary right-side panel is currently visible. */
  readonly secondaryPanelVisible: boolean;
  /** Current secondary panel width in pixels (clamped to [SECONDARY_PANEL_WIDTH_MIN, SECONDARY_PANEL_WIDTH_MAX]). */
  readonly secondaryPanelWidth: number;
  /** The current split layout state for the main content area, or null if not in a split layout. */
  readonly splitPanelLayout: LayoutSplittableRegionModel | null;
  /** Current internal zone dimensions for CSS grid-based resize. */
  readonly internalZoneDimensions: Map<DockZone, ZoneDimensionState>;
}

export const initialLayoutState: LayoutState = {
  sidebarVisible: true,
  sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
  bottomPanelVisible: false,
  bottomPanelHeight: BOTTOM_PANEL_HEIGHT_DEFAULT,
  activeSidebarItem: null,
  secondaryPanelVisible: false,
  secondaryPanelWidth: SECONDARY_PANEL_WIDTH_DEFAULT,
  splitPanelLayout: null,
  internalZoneDimensions: new Map<DockZone, ZoneDimensionState>(),
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
    bottomPanelHeight: Math.min(BOTTOM_PANEL_HEIGHT_MAX, Math.max(BOTTOM_PANEL_HEIGHT_MIN, Math.round(height))),
  })),
  on(LayoutActions.setActiveSidebarItem, (state, { itemId }) => ({
    ...state,
    activeSidebarItem: itemId,
  })),
  on(LayoutActions.setSidebarVisible, (state, { visible }) => ({
    ...state,
    sidebarVisible: visible,
  })),
  on(LayoutActions.setBottomPanelVisible, (state, { visible }) => ({
    ...state,
    bottomPanelVisible: visible,
  })),
  on(LayoutActions.toggleSecondaryPanel, (state) => ({
    ...state,
    secondaryPanelVisible: !state.secondaryPanelVisible,
  })),
  on(LayoutActions.setSecondaryPanelVisible, (state, { visible }) => ({
    ...state,
    secondaryPanelVisible: visible,
  })),
  on(LayoutActions.setSecondaryPanelWidth, (state, { width }) => ({
    ...state,
    secondaryPanelWidth: Math.min(SECONDARY_PANEL_WIDTH_MAX, Math.max(SECONDARY_PANEL_WIDTH_MIN, Math.round(width))),
  })),
  on(
    LayoutActions.restoreLayout,
    (state, { sidebarVisible, sidebarWidth, bottomPanelVisible, bottomPanelHeight, secondaryPanelVisible, secondaryPanelWidth, splitPanelLayout }) => ({
      ...state,
      sidebarVisible,
      sidebarWidth: Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, sidebarWidth)),
      bottomPanelVisible,
      bottomPanelHeight: Math.min(BOTTOM_PANEL_HEIGHT_MAX, Math.max(BOTTOM_PANEL_HEIGHT_MIN, bottomPanelHeight)),
      secondaryPanelVisible,
      secondaryPanelWidth: Math.min(SECONDARY_PANEL_WIDTH_MAX, Math.max(SECONDARY_PANEL_WIDTH_MIN, secondaryPanelWidth)),
      splitPanelLayout,
    })
  ),
  on(LayoutActions.setSplitLayout, (state, { splitLayout }) => ({
    ...state,
    splitPanelLayout: splitLayout,
    // When setting a split layout, we want to hide the sidebar and bottom panel to maximize available space for the splits. The split layout itself will determine the visibility of the secondary panel as needed.
  })),
  on(LayoutActions.setSplitPaneSize, (state, { paneId, size }) => ({
    ...state,
    // Implementation for setting split pane size would go here
  })),
  // Zone Resize Reducers
  on(LayoutActions.startZoneResize, (state, { zone, direction, initialDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zone) || {
      zone,
      width: 200,
      height: 200,
      minWidth: 100,
      minHeight: 100,
    };
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zone, {
        ...currentDimension,
        [direction === 'horizontal' ? 'width' : 'height']: initialDimension,
      }),
    };
  }),
  
  on(LayoutActions.draftZoneDimension, (state, { zone, draftDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zone);
    if (!currentDimension) return state;
    
    const isHorizontal = currentDimension.width !== undefined;
    const newDimension = isHorizontal 
      ? Math.min(1000, Math.max(100, draftDimension)) // 100px min, 1000px max
      : Math.min(1000, Math.max(100, draftDimension));
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zone, {
        ...currentDimension,
        [isHorizontal ? 'width' : 'height']: newDimension,
      }),
    };
  }),
  
  on(LayoutActions.commitZoneDimension, (state, { zone, committedDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zone);
    if (!currentDimension) return state;
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zone, {
        ...currentDimension,
        width: currentDimension.width !== undefined ? committedDimension : currentDimension.width,
        height: currentDimension.height !== undefined ? committedDimension : currentDimension.height,
      }),
    };
  }),
  
  on(LayoutActions.cancelZoneResize, (state) => {
    // Clear draft dimensions but keep committed dimensions
    return {
      ...state,
      internalZoneDimensions: new Map(
        Array.from(state.internalZoneDimensions.entries()).map(([key, val]) => [key, {
          ...val,
          width: val.width,
          height: val.height,
        }])
      ),
    };
  }),
);
