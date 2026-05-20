import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Type } from '@angular/core';
import { WorkspaceState, TabGroupState } from './workspace.reducer';
import { TabItem, TabCloseGuard } from '../../../shell/models/tab-item.model';
import { DockZone } from '../../models/dock-zone-assignment.model';

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
  createSelector(selectTabGroupById(groupId), (group): TabItem[] => [...(group?.tabs ?? [])]);

/** Active tab ID for the primary tab group. */
export const selectActiveShellTabId = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group) => group?.activeTabId ?? null);

/** Component type of the active tab for ContentArea rendering. */
export const selectActiveShellComponentType = (groupId: string) =>
  createSelector(selectTabGroupById(groupId), (group) => {
    if (!group?.activeTabId) return null;
    const activeTab = group.tabs.find((t) => t.id === group.activeTabId);
    return activeTab?.componentType ?? null;
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
      if (tab.closeGuard) {
        guards[tab.id] = tab.closeGuard;
      }
    }
    return guards;
  });
