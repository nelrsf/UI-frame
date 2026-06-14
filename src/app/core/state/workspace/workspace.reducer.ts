import { createReducer, on } from '@ngrx/store';
import { DockZone } from '../../models/dock-zone-assignment.model';
import * as WorkspaceActions from './workspace.actions';
import { ShellTab } from '../../../shell/contracts/ShellTab';
import { isTabCloseable, isTabDraggable, isTabPinnable } from '../../../shell/common/ShellTabGuardTypes';
import { WithDraggable } from '../../../shell/models/tab-item.model';

export interface WorkspaceState {
  /** All central region tabs ever registered; closeTab leaves them here for reopening. */
  readonly registeredTabs: readonly ShellTab[];
  /** Currently open tabs in the central region; order reflects tab strip order. */
  readonly tabsByZone: Map<DockZone, readonly ShellTab[]>;
  /** Id of the active tab in each region, or null if no tabs are open. */
  readonly activeTabIdsByZone: Map<DockZone, string | null>;

}

export const initialWorkspaceState: WorkspaceState = {
  registeredTabs: [],
  tabsByZone: new Map(),
  activeTabIdsByZone: new Map(),
};

function resolveActiveAfterRemoval(
  currentActiveId: string | null,
  removedTabId: string,
  removedIndex: number,
  remainingTabs: readonly ShellTab[]
): string | null {
  if (currentActiveId !== removedTabId) {
    return currentActiveId;
  }

  if (remainingTabs.length === 0) {
    return null;
  }

  return removedIndex > 0
    ? remainingTabs[removedIndex - 1].id
    : remainingTabs[0].id;
}

function registerTab(state: WorkspaceState, tab: ShellTab): WorkspaceState {
  if (!tab) {
    return state;
  }

  if (state.registeredTabs.some((existing) => existing.id === tab.id)) {
    return state;
  }

  return {
    ...state,
    registeredTabs: [...state.registeredTabs, tab],
  };
}

function findTabsById(state: WorkspaceState, tabId: string): { zone: DockZone; tabs: readonly ShellTab[] } | null {
  for (const [zone, tabs] of state.tabsByZone.entries()) {
    if (tabs.some((tab) => tab.id === tabId)) {
      return { zone, tabs };
    }
  }
  return null;
}

export const workspaceReducer = createReducer(
  initialWorkspaceState,
  on(WorkspaceActions.registerTab, (state, { tab }) => registerTab(state, tab)),

  on(WorkspaceActions.openTab, (state, { tab, zone }) => {
    if (!tab) {
      return state;
    }

    if (state.tabsByZone.get(zone)?.some((existing) => existing.id === tab.id)) {
      return { ...state, activeTabIdsByZone: new Map(state.activeTabIdsByZone).set(zone, tab.id) };
    }

    if (!state.registeredTabs.some((existing) => existing.id === tab.id)) {
      console.warn(
        `[Workspace] openTab: tab '${tab.id}' not registered. Call registerTab first.`
      );
      return state;
    }

    if (isTabDraggable(tab) && tab.draggable) {
      // On draggable tabs ensure source DockZone
      tab.draggable.sourceZone = zone;
    }

    return {
      ...state,
      tabsByZone: new Map(state.tabsByZone).set(zone, [...(state.tabsByZone.get(zone) || []), tab]),
      activeTabIdsByZone: new Map(state.activeTabIdsByZone).set(zone, tab.id),
    };
  }),

  on(WorkspaceActions.closeTab, (state, { tabId }) => {

    const found = findTabsById(state, tabId);
    const zone = found?.zone;

    if (!zone) {
      return state;
    }

    const tabsByZone = state.tabsByZone.get(zone);
    const tabIdx = tabsByZone?.findIndex((tab) => tab.id === tabId) ?? -1;
    if (tabIdx < 0) {
      return state;
    }

    const tab = tabsByZone?.[tabIdx];

    if (!tab) return state;

    if (!isTabCloseable(tab)) {
      return state;
    }

    if (isTabPinnable(tab) && tab.pinnable?.pinned) {
      return state;
    }

    const tabs = tabsByZone?.filter((candidate) => candidate.id !== tabId) ?? [];

    const activeTabId = resolveActiveAfterRemoval(state.activeTabIdsByZone.get(zone) ?? null, tabId, tabIdx, tabs ?? [])

    return {
      ...state,
      tabsByZone: new Map(state.tabsByZone).set(zone, tabs),
      activeTabIdsByZone: new Map(state.activeTabIdsByZone).set(zone, activeTabId),
    };
  }),

  on(WorkspaceActions.selectTab, (state, { tabId }) => {

    const found = findTabsById(state, tabId);
    const zoneId = found?.zone;
    const tabsByZone = found?.tabs;

    if (!tabsByZone || !zoneId) {
      return state;
    }

    return { ...state, activeTabIdsByZone: new Map(state.activeTabIdsByZone).set(zoneId, tabId) };
  }),

  on(WorkspaceActions.reorderTab, (state, { zone, toIndex, reorderedTab }) => {

    if (toIndex === null || toIndex === undefined) {
      return state;
    }
    const tabsByZone = state.tabsByZone.get(zone);

    if (!tabsByZone) {
      return state;
    }

    const fromIndex = tabsByZone.indexOf(reorderedTab);

    if (
      fromIndex < 0 ||
      fromIndex >= tabsByZone?.length ||
      toIndex < 0 ||
      toIndex > tabsByZone?.length ||
      fromIndex === toIndex
    ) {
      return state;
    }

    const tabs = [...tabsByZone];
    const [moved] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, moved);

    return { ...state, tabsByZone: new Map(state.tabsByZone).set(zone, tabs) };
  }),

  on(WorkspaceActions.setTabDirty, (state, { tabId, dirty }) => {
    const found = findTabsById(state, tabId);
    const zoneId = found?.zone;
    const tabsByZone = found?.tabs;


    if (!tabsByZone || !zoneId) {
      return state;
    }

    const tab = tabsByZone?.find((t) => t.id === tabId);
    if (!tab || !isTabCloseable(tab)) {
      return state;
    }

    if (!tab.closeable) {
      return state;
    }

    tab.closeable.dirty = dirty;
    return { ...state, tabsByZone: new Map(state.tabsByZone).set(zoneId, [...tabsByZone]) };

  }),

  on(WorkspaceActions.setTabPinned, (state, { tabId, pinned }) => {
    const found = findTabsById(state, tabId);
    const zoneId = found?.zone;
    const tabsByZone = found?.tabs;

    if (!tabsByZone || !zoneId) {
      return state;
    }

    const tab = tabsByZone?.find((t) => t.id === tabId);
    if (!tab || !isTabPinnable(tab)) {
      return state;
    }

    if (!tab.pinnable) {
      return state;
    }

    tab.pinnable.pinned = pinned;
    return { ...state, tabsByZone: new Map(state.tabsByZone).set(zoneId, [...tabsByZone]) };

  }),

  on(WorkspaceActions.moveTabToZone, (state, { tabId, sourceZone, targetZone, tabMetadata }) => {

    const found = findTabsById(state, tabId);
    const currentZone = found?.zone;
    const tabsByZone = found?.tabs;

    if (!tabsByZone || !currentZone || currentZone !== sourceZone) {
      return state;
    }

    const tabIdx = tabsByZone.findIndex((tab) => tab.id === tabId);
    if (tabIdx < 0) {
      return state;
    }

    const tab: ShellTab & WithDraggable = tabsByZone[tabIdx];

    if (!isTabDraggable(tab) || !tab.draggable) {
      return state;
    }

    const updatedSourceTabs = tabsByZone.filter((candidate) => candidate.id !== tabId);
    const newTab = { ...tab, ...tabMetadata };
    if (isTabDraggable(newTab) && newTab.draggable) {
      newTab.draggable = { ...newTab.draggable, sourceZone: targetZone };
    }
    let updatedTargetTabs;
    if (newTab.draggable?.reorderTargetIndex === null || newTab.draggable?.reorderTargetIndex == undefined) {
      updatedTargetTabs = [...(state.tabsByZone.get(targetZone) || []), newTab];
    } else {
      updatedTargetTabs = [...(state.tabsByZone.get(targetZone) || [])];
      updatedTargetTabs.splice(newTab.draggable.reorderTargetIndex, 0, newTab)
    }


    return {
      ...state,
      tabsByZone: new Map(state.tabsByZone).set(currentZone, updatedSourceTabs).set(targetZone, updatedTargetTabs),
      activeTabIdsByZone: new Map(state.activeTabIdsByZone).set(targetZone, tab.id)
    };
  }),
);
