import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WorkspaceState } from './workspace.reducer';
import { TabCloseGuard } from '../../../shell/models/tab-item.model';
import { ShellTab } from '../../../shell/contracts/ShellTab';
import { isTabCloseable } from '../../../shell/common/ShellTabGuardTypes';

export const selectWorkspaceState = createFeatureSelector<WorkspaceState>('workspace');

export const selectShellTabs = createSelector(
  selectWorkspaceState,
  (state): ShellTab[] => [...state.tabs]
);

export const selectRegisteredTabs = createSelector(
  selectWorkspaceState,
  (state): ShellTab[] => [...state.registeredTabs]
);

export const selectActiveShellTabId = createSelector(
  selectWorkspaceState,
  (state) => state.activeTabId
);

export const selectActiveShellComponentType = createSelector(
  selectShellTabs,
  selectActiveShellTabId,
  (tabs, activeTabId) => {
    if (!activeTabId) return null;
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    return activeTab?.component ?? null;
  }
);

export const selectActiveShellTab = createSelector(
  selectShellTabs,
  selectActiveShellTabId,
  (tabs, activeTabId) => {
    if (!activeTabId) return null;
    return tabs.find((tab) => tab.id === activeTabId) ?? null;
  }
);

export const selectCloseGuards = createSelector(
  selectShellTabs,
  (tabs): Record<string, TabCloseGuard> => {
    const guards: Record<string, TabCloseGuard> = {};
    for (const tab of tabs) {
      if (isTabCloseable(tab) && tab.closeable?.closeGuard) {
        guards[tab.id] = tab.closeable.closeGuard;
      }
    }
    return guards;
  }
);

export const selectBottomPanelTabs = createSelector(
  selectWorkspaceState,
  (state) => state.bottomPanelTabs
);

export const selectSecondaryPanelEntries = createSelector(
  selectWorkspaceState,
  (state) => state.secondaryPanelEntries
);

export const selectActiveSecondaryPanelEntryId = createSelector(
  selectWorkspaceState,
  (state) => state.activeSecondaryPanelEntryId
);

export const selectActiveSecondaryPanelComponentType = createSelector(
  selectSecondaryPanelEntries,
  selectActiveSecondaryPanelEntryId,
  (entries, activeId) => {
    if (!activeId) {
      return null;
    }

    const activeEntry = entries.find((entry) => entry.id === activeId);
    return activeEntry?.component ?? null;
  }
);
