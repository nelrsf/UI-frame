import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WorkspaceState, TabGroupState } from './workspace.reducer';
import { TabCloseGuard } from '../../../shell/models/tab-item.model';
import { DockZone } from '../../models/dock-zone-assignment.model';
import { ShellTab } from '../../../shell/contracts/ShellTab';
import { isTabCloseable } from '../../../shell/common/ShellTabGuardTypes';


export const selectWorkspaceState = createFeatureSelector<WorkspaceState>('workspace');

export const selectTabGroups = createSelector(
  selectWorkspaceState,
  (state) => state.tabGroups
);

export const selectTabGroupById = (groupId: string) =>
  createSelector(selectTabGroups, (groups) => groups.find((g) => g.groupId === groupId) ?? null);

export const selectTabsForGroup = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group) => group?.tabs ?? []);

export const selectActiveTabId = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group) => group?.activeTabId ?? null);

export const selectGroupsByZone = (zone: DockZone) =>
  createSelector(selectTabGroups, (groups) => groups.filter((g) => g.zone === zone));

// ── Shell tab selectors (primary workspace tab bar) ─────────────────────────

/** Flat list of TabItem[] for the primary tab group. */
export const selectShellTabs = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group): ShellTab[] => [...(group?.tabs ?? [])]);

/** All registered tabs for a group (including closed ones, for the add-tab modal). */
export const selectRegisteredTabsForGroup = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group): ShellTab[] => [...(group?.registeredTabs ?? [])]);

/** Active tab ID for the primary tab group. */
export const selectActiveShellTabId = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group) => group?.activeTabId ?? null);

/** Component type of the active tab for ContentArea rendering. */
export const selectActiveShellComponentType = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group) => {
    if (!group?.activeTabId) return null;
    const activeTab = group.tabs.find((t) => t.id === group.activeTabId);
    return activeTab?.component ?? null;
  });

/** Full active tab metadata for ContentArea. */
export const selectActiveShellTab = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group) => {
    if (!group?.activeTabId) return null;
    return group.tabs.find((t) => t.id === group.activeTabId) ?? null;
  });

/** Map of tabId to TabCloseGuard for TabBarComponent close guard input. */
export const selectCloseGuardsForGroup = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group): Record<string, TabCloseGuard> => {
    if (!group) return {};
    const guards: Record<string, TabCloseGuard> = {};
    for (const tab of group.tabs) {
      if (isTabCloseable(tab) && tab.closeable?.closeGuard) {
        guards[tab.id] = tab.closeable.closeGuard;
      }
    }
    return guards;
  });

// ── Panel selectors (bottom panel & secondary panel) ────────────────────────

/** All bottom panel tabs. */
export const selectBottomPanelTabs = createSelector(
  selectWorkspaceState,
  (state) => state.bottomPanelTabs
);

/** All secondary panel entries. */
export const selectSecondaryPanelEntries = createSelector(
  selectWorkspaceState,
  (state) => state.secondaryPanelEntries
);

/** Active secondary panel entry ID. */
export const selectActiveSecondaryPanelEntryId = createSelector(
  selectWorkspaceState,
  (state) => state.activeSecondaryPanelEntryId
);

/** Component type of the active secondary panel entry. */
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
