import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WorkspaceState } from './workspace.reducer';
import { TabCloseGuard } from '../../../shell/models/tab-item.model';
import { ShellTab } from '../../../shell/contracts/ShellTab';
import { isTabCloseable } from '../../../shell/common/ShellTabGuardTypes';
import { DockZone } from '../../models/dock-zone-assignment.model';

export const selectWorkspaceState = createFeatureSelector<WorkspaceState>('workspace');

export const selectShellTabs = createSelector(
  selectWorkspaceState,
  (state): Map<DockZone, readonly ShellTab[]> => state.tabsByZone
);

export const selectRegisteredTabs = createSelector(
  selectWorkspaceState,
  (state): ShellTab[] => [...state.registeredTabs]
);

export const selectActiveIds = createSelector(
  selectWorkspaceState,
  (state) => state.activeTabIdsByZone
);

export const selectActiveShellTabId = createSelector(
  selectWorkspaceState,
  (state) => Array.from(state.activeTabIdsByZone.values()).find((id): id is string => id != null) ?? null
);

export const selectActiveShellComponentType = createSelector(
  selectShellTabs,
  selectActiveShellTabId,
  (tabs, activeTabId) => {
    if (!activeTabId) return null;
    // Find the active tab across all zones (assuming unique tab IDs across zones) and return its component type.
    const allTabs = Array.from(tabs.values()).flat();
    const activeTab = allTabs.find((tab) => tab.id === activeTabId);
    return activeTab?.component ?? null;
  }
);

export const selectActiveShellTab = createSelector(
  selectShellTabs,
  selectActiveShellTabId,
  (tabs, activeTabId) => {
    if (!activeTabId) return null;
    const allTabs = Array.from(tabs.values()).flat();
    return allTabs.find((tab) => tab.id === activeTabId) ?? null;
  }
);

export const selectCloseGuards = createSelector(
  selectShellTabs,
  (tabs): Record<string, TabCloseGuard> => {
    const allTabs = Array.from(tabs.values()).flat();
    const guards: Record<string, TabCloseGuard> = {};
    for (const tab of allTabs) {
      if (isTabCloseable(tab) && tab.closeable?.closeGuard) {
        guards[tab.id] = tab.closeable.closeGuard;
      }
    }
    return guards;
  }
);
