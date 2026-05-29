import { createReducer, on } from '@ngrx/store';
import { DockZone } from '../../models/dock-zone-assignment.model';
import * as WorkspaceActions from './workspace.actions';
import { ShellTab } from '../../../shell/contracts/ShellTab';
import { isTabCloseable, isTabDraggable, isTabPinnable } from '../../../shell/common/ShellTabGuardTypes';

export interface WorkspaceState {
  /** All central region tabs ever registered; closeTab leaves them here for reopening. */
  readonly registeredTabs: readonly ShellTab[];
  /** Ordered list of currently open central region tabs. */
  readonly tabs: readonly ShellTab[];
  /** Active central region tab id, or null when no central tab is open. */
  readonly activeTabId: string | null;
  /** Bottom panel tabs registered in this workspace. */
  readonly bottomPanelTabs: readonly ShellTab[];
  /** Secondary panel entries registered in this workspace. */
  readonly secondaryPanelEntries: readonly ShellTab[];
  /** ID of the currently active secondary panel entry. */
  readonly activeSecondaryPanelEntryId: string | null;
}

export const initialWorkspaceState: WorkspaceState = {
  registeredTabs: [],
  tabs: [],
  activeTabId: null,
  bottomPanelTabs: [],
  secondaryPanelEntries: [],
  activeSecondaryPanelEntryId: null,
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

function registerCentralTab(state: WorkspaceState, tab: ShellTab): WorkspaceState {
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

export const workspaceReducer = createReducer(
  initialWorkspaceState,

  on(WorkspaceActions.registerTab, (state, { tab }) => registerCentralTab(state, tab)),

  on(WorkspaceActions.openTab, (state, { tab }) => {
    if (!tab) {
      return state;
    }

    if (state.tabs.some((existing) => existing.id === tab.id)) {
      return { ...state, activeTabId: tab.id };
    }

    if (!state.registeredTabs.some((existing) => existing.id === tab.id)) {
      console.warn(
        `[Workspace] openTab: tab '${tab.id}' not registered. Call registerTab first.`
      );
      return state;
    }

    return {
      ...state,
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
    };
  }),

  on(WorkspaceActions.registerAndOpenTab, (state, { tab }) => {
    const registered = registerCentralTab(state, tab);
    return tab ? { ...registered, activeTabId: tab.id } : registered;
  }),

  on(WorkspaceActions.closeTab, (state, { tabId }) => {
    const tabIdx = state.tabs.findIndex((tab) => tab.id === tabId);
    if (tabIdx < 0) {
      return state;
    }

    const tab = state.tabs[tabIdx];
    if (!isTabCloseable(tab)) {
      return state;
    }

    if (isTabPinnable(tab) && tab.pinnable?.pinned) {
      return state;
    }

    const tabs = state.tabs.filter((candidate) => candidate.id !== tabId);

    return {
      ...state,
      tabs,
      activeTabId: resolveActiveAfterRemoval(state.activeTabId, tabId, tabIdx, tabs),
    };
  }),

  on(WorkspaceActions.selectTab, (state, { tabId }) => {
    if (!state.tabs.some((tab) => tab.id === tabId)) {
      return state;
    }

    return { ...state, activeTabId: tabId };
  }),

  on(WorkspaceActions.reorderTab, (state, { workspaceId, fromIndex, toIndex }) => {
    void workspaceId;

    if (
      fromIndex < 0 ||
      fromIndex >= state.tabs.length ||
      toIndex < 0 ||
      toIndex > state.tabs.length ||
      fromIndex === toIndex
    ) {
      return state;
    }

    const tabs = [...state.tabs];
    const [moved] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, moved);

    return { ...state, tabs };
  }),

  on(WorkspaceActions.setTabDirty, (state, { tabId, dirty }) => ({
    ...state,
    tabs: state.tabs.map((tab) =>
      tab.id === tabId && isTabCloseable(tab)
        ? { ...tab, closeable: { ...tab.closeable, dirty } }
        : tab
    ),
    registeredTabs: state.registeredTabs.map((tab) =>
      tab.id === tabId && isTabCloseable(tab)
        ? { ...tab, closeable: { ...tab.closeable, dirty } }
        : tab
    ),
  })),

  on(WorkspaceActions.setTabPinned, (state, { tabId, pinned }) => ({
    ...state,
    tabs: state.tabs.map((tab) =>
      tab.id === tabId && isTabPinnable(tab)
        ? { ...tab, pinnable: { ...tab.pinnable, pinned } }
        : tab
    ),
    registeredTabs: state.registeredTabs.map((tab) =>
      tab.id === tabId && isTabPinnable(tab)
        ? { ...tab, pinnable: { ...tab.pinnable, pinned } }
        : tab
    ),
  })),

  on(WorkspaceActions.removeTab, (state, { tabId }) => {
    const tabIdx = state.tabs.findIndex((tab) => tab.id === tabId);
    if (tabIdx < 0 && !state.registeredTabs.some((tab) => tab.id === tabId)) {
      return state;
    }

    const tabs = state.tabs.filter((tab) => tab.id !== tabId);
    const registeredTabs = state.registeredTabs.filter((tab) => tab.id !== tabId);

    return {
      ...state,
      tabs,
      registeredTabs,
      activeTabId: resolveActiveAfterRemoval(state.activeTabId, tabId, tabIdx, tabs),
    };
  }),

  on(WorkspaceActions.moveTabToZone, (state, { tabId, sourceZone, targetZone, tabMetadata }) => {
    let nextState = state;

    if (sourceZone === DockZone.PrimaryWorkspace) {
      const tabIdx = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIdx < 0) {
        return state;
      }

      const tabs = state.tabs.filter((tab) => tab.id !== tabId);
      nextState = {
        ...state,
        tabs,
        activeTabId: resolveActiveAfterRemoval(state.activeTabId, tabId, tabIdx, tabs),
      };
    } else if (sourceZone === DockZone.BottomPanel) {
      nextState = {
        ...state,
        bottomPanelTabs: state.bottomPanelTabs.filter((tab) => tab.id !== tabId),
      };
    } else if (sourceZone === DockZone.SecondaryPanel) {
      const secondaryPanelEntries = state.secondaryPanelEntries.filter((tab) => tab.id !== tabId);
      nextState = {
        ...state,
        secondaryPanelEntries,
        activeSecondaryPanelEntryId: tabMetadata.id,
      };
    }

    if (isTabDraggable(tabMetadata) && tabMetadata.draggable) {
      tabMetadata.draggable.sourceZone = targetZone;
    } else {
      throw new Error(`[Workspace] moveTabToZone: Tab '${tabId}' is not draggable but received in moveTabToZone action.`);
    }

    if (targetZone === DockZone.PrimaryWorkspace) {
      nextState = {
        ...nextState,
        tabs: [...nextState.tabs, tabMetadata],
        activeTabId: tabMetadata.id,
      }
    } else if (targetZone === DockZone.BottomPanel) {
      nextState = {
        ...nextState,
        bottomPanelTabs: [...nextState.bottomPanelTabs, tabMetadata],
      };
    } else if (targetZone === DockZone.SecondaryPanel) {
      nextState = {
        ...nextState,
        secondaryPanelEntries: [...nextState.secondaryPanelEntries, tabMetadata],
        activeSecondaryPanelEntryId: tabMetadata.id,
      };
    }

    return nextState;

  }),

  on(WorkspaceActions.addBottomPanelEntry, (state, panelTab) => {
    const idExists = state.bottomPanelTabs.some((tab) => tab.id === panelTab.id);
    if (idExists) {
      console.warn(`[Workspace] Bottom panel tab with id '${panelTab.id}' already exists. Ignoring.`);
      return state;
    }
    return {
      ...state,
      bottomPanelTabs: [...state.bottomPanelTabs, panelTab],
    };
  }),

  on(WorkspaceActions.removeBottomPanelEntry, (state, { entryId }) => {
    const exists = state.bottomPanelTabs.some((tab) => tab.id === entryId);
    if (!exists) return state;

    const bottomPanelTabs = state.bottomPanelTabs.filter((tab) => tab.id !== entryId);
    return { ...state, bottomPanelTabs };
  }),

  on(WorkspaceActions.reorderBottomPanelTabs, (state, { workspaceId, fromIndex, toIndex }) => {
    void workspaceId;

    if (
      fromIndex < 0 ||
      fromIndex >= state.bottomPanelTabs.length ||
      toIndex < 0 ||
      toIndex >= state.bottomPanelTabs.length ||
      fromIndex === toIndex
    ) {
      return state;
    }

    const bottomPanelTabs = [...state.bottomPanelTabs];
    const [moved] = bottomPanelTabs.splice(fromIndex, 1);
    bottomPanelTabs.splice(toIndex, 0, moved);

    return { ...state, bottomPanelTabs };
  }),

  on(WorkspaceActions.addSecondaryPanelEntry, (state, { entry }) => {
    const idExists = state.secondaryPanelEntries.some((existing) => existing.id === entry.id);
    if (idExists) {
      console.warn(`[Workspace] Secondary panel entry with id '${entry.id}' already exists. Ignoring.`);
      return state;
    }

    const secondaryPanelEntries = [...state.secondaryPanelEntries, entry];



    return {
      ...state,
      secondaryPanelEntries,
      activeSecondaryPanelEntryId: entry.id,
    };
  }),

  on(WorkspaceActions.removeSecondaryPanelEntry, (state, { entryId }) => {
    const exists = state.secondaryPanelEntries.some((entry) => entry.id === entryId);
    if (!exists) return state;

    const secondaryPanelEntries = state.secondaryPanelEntries.filter((entry) => entry.id !== entryId);
    const activeSecondaryPanelEntryId = secondaryPanelEntries[secondaryPanelEntries.length - 1]?.id ?? null;

    return { ...state, secondaryPanelEntries, activeSecondaryPanelEntryId };
  }),

  on(WorkspaceActions.setActiveSecondaryPanelEntry, (state, { id }) => {
    const exists = state.secondaryPanelEntries.some((entry) => entry.id === id);
    if (exists) {
      return { ...state, activeSecondaryPanelEntryId: id };
    }

    console.warn(`[Workspace] Secondary panel entry with id '${id}' not found. Applying fallback.`);
    return {
      ...state,
      activeSecondaryPanelEntryId: id,
    };
  }),

  on(WorkspaceActions.reorderSecondaryPanelEntries, (state, { workspaceId, fromIndex, toIndex }) => {
    void workspaceId;

    if (
      fromIndex < 0 ||
      fromIndex >= state.secondaryPanelEntries.length ||
      toIndex < 0 ||
      toIndex >= state.secondaryPanelEntries.length ||
      fromIndex === toIndex
    ) {
      return state;
    }

    const secondaryPanelEntries = [...state.secondaryPanelEntries];
    const [moved] = secondaryPanelEntries.splice(fromIndex, 1);
    secondaryPanelEntries.splice(toIndex, 0, moved);

    const activeSecondaryPanelEntryId =
      state.activeSecondaryPanelEntryId === moved.id
        ? secondaryPanelEntries[toIndex]?.id ?? null
        : state.activeSecondaryPanelEntryId;

    return { ...state, secondaryPanelEntries, activeSecondaryPanelEntryId };
  })
);
