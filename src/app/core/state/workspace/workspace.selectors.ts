import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WorkspaceState } from './workspace.reducer';
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
