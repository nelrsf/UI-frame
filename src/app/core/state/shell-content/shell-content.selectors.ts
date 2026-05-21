import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShellContentState } from './shell-content.reducer';

/**
 * Select the root shell content state.
 */
export const selectShellContentState = createFeatureSelector<ShellContentState>('shellContent');

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
