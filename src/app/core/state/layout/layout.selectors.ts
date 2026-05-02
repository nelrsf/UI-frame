import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LayoutState } from './layout.reducer';

export const selectLayoutState = createFeatureSelector<LayoutState>('layout');

export const selectSidebarVisible = createSelector(
  selectLayoutState,
  (state) => state.sidebarVisible
);

export const selectSidebarWidth = createSelector(
  selectLayoutState,
  (state) => state.sidebarWidth
);

export const selectBottomPanelVisible = createSelector(
  selectLayoutState,
  (state) => state.bottomPanelVisible
);

export const selectBottomPanelHeight = createSelector(
  selectLayoutState,
  (state) => state.bottomPanelHeight
);

export const selectActiveSidebarItem = createSelector(
  selectLayoutState,
  (state) => state.activeSidebarItem
);

export const selectSecondaryPanelVisible = createSelector(
  selectLayoutState,
  (state) => state.secondaryPanelVisible
);

export const selectSecondaryPanelWidth = createSelector(
  selectLayoutState,
  (state) => state.secondaryPanelWidth
);

/**
 * Returns a snapshot object matching the payload shape of the
 * `shell.layout.changed.v1` event so the shell can publish consistent
 * layout-change events without duplicating field access.
 */
export const selectLayoutSnapshot = createSelector(selectLayoutState, (state) => ({
  sidebarVisible: state.sidebarVisible,
  sidebarWidth: state.sidebarWidth,
  bottomPanelVisible: state.bottomPanelVisible,
  bottomPanelHeight: state.bottomPanelHeight,
  activeSidebarItem: state.activeSidebarItem,
  secondaryPanelVisible: state.secondaryPanelVisible,
  secondaryPanelWidth: state.secondaryPanelWidth,
}));
