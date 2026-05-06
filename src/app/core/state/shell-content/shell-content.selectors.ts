import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShellContentState } from './shell-content.reducer';
import { TabItem } from '../../../shell/models/tab-item.model';

/**
 * Select the root shell content state.
 */
export const selectShellContentState = createFeatureSelector<ShellContentState>('shellContent');

/**
 * Select all shell tabs with their component types.
 */
export const selectShellTabs = createSelector(
  selectShellContentState,
  (state: ShellContentState): TabItem[] => state.tabs.map((shellTab) => shellTab.tabItem)
);

/**
 * Select the active shell tab ID.
 */
export const selectActiveShellTabId = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.activeShellTabId
);

/**
 * Select the active shell tab's component type for dynamic rendering.
 */
export const selectActiveShellComponentType = createSelector(
  selectShellContentState,
  selectActiveShellTabId,
  (state, activeTabId) => {
    if (!activeTabId) return null;
    const activeTab = state.tabs.find((tab) => tab.tabItem.id === activeTabId);
    return activeTab?.componentType || null;
  }
);

/**
 * Select all sidebar items.
 */
export const selectShellSidebarItems = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.sidebarItems
);

/**
 * Select all toolbar actions.
 */
export const selectShellToolbarActions = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.toolbarActions
);

/**
 * Select all bottom panel tabs.
 */
export const selectShellBottomPanelTabs = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.bottomPanelTabs
);

/**
 * Select all registered secondary panel entries.
 */
export const selectShellSecondaryPanelEntries = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.secondaryPanelEntries
);

/**
 * Select the active secondary panel entry ID.
 */
export const selectActiveSecondaryPanelEntryId = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.activeSecondaryPanelEntryId
);

/**
 * Select the active secondary panel entry component type.
 */
export const selectActiveSecondaryPanelComponentType = createSelector(
  selectShellSecondaryPanelEntries,
  selectActiveSecondaryPanelEntryId,
  (entries, activeId) => {
    if (!activeId) {
      return null;
    }

    const activeEntry = entries.find((entry) => entry.id === activeId);
    return activeEntry?.component ?? null;
  }
);
