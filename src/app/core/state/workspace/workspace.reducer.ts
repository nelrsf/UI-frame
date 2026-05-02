import { createReducer, on } from '@ngrx/store';
import { TabItem } from '../../../shell/models/tab-item.model';
import { DockZone } from '../../models/dock-zone-assignment.model';
import * as WorkspaceActions from './workspace.actions';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

/**
 * In-memory state for a single tab group.
 *
 * A tab group is the unit rendered by a `TabBarComponent` instance and can be
 * assigned to one of the three MVP dock zones.
 */
export interface TabGroupState {
  /** Stable identifier for this group (matches `TabItem.groupId`). */
  readonly groupId: string;
  /** Ordered list of open tabs. Order matches the visual display order. */
  readonly tabs: readonly TabItem[];
  /** Id of the currently active tab, or `null` when the group is empty. */
  readonly activeTabId: string | null;
  /** The dock zone this group is assigned to. */
  readonly zone: DockZone;
}

/** Root workspace state managed by this reducer. */
export interface WorkspaceState {
  /** All known tab groups, in the order they were first created. */
  readonly tabGroups: readonly TabGroupState[];
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialWorkspaceState: WorkspaceState = {
  tabGroups: [],
};

// ---------------------------------------------------------------------------
// Internal helpers (pure, not exported)
// ---------------------------------------------------------------------------

function groupIndex(state: WorkspaceState, groupId: string): number {
  return state.tabGroups.findIndex((g) => g.groupId === groupId);
}

function updateGroup(
  state: WorkspaceState,
  groupId: string,
  updater: (group: TabGroupState) => TabGroupState
): WorkspaceState {
  const idx = groupIndex(state, groupId);
  if (idx < 0) return state;
  const groups = [...state.tabGroups] as TabGroupState[];
  groups[idx] = updater(groups[idx]);
  return { ...state, tabGroups: groups };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export const workspaceReducer = createReducer(
  initialWorkspaceState,

  // ── openTab ──────────────────────────────────────────────────────────────
  on(WorkspaceActions.openTab, (state, { tab }) => {
    const idx = groupIndex(state, tab.groupId);

    if (idx >= 0) {
      const group = state.tabGroups[idx];
      // Tab already present — just activate it.
      if (group.tabs.some((t) => t.id === tab.id)) {
        return updateGroup(state, tab.groupId, (g) => ({ ...g, activeTabId: tab.id }));
      }
      // Append to existing group.
      const groups = [...state.tabGroups] as TabGroupState[];
      groups[idx] = { ...group, tabs: [...group.tabs, tab], activeTabId: tab.id };
      return { ...state, tabGroups: groups };
    }

    // Create a new group assigned to PrimaryWorkspace by default.
    return {
      ...state,
      tabGroups: [
        ...state.tabGroups,
        {
          groupId: tab.groupId,
          tabs: [tab],
          activeTabId: tab.id,
          zone: DockZone.PrimaryWorkspace,
        },
      ],
    };
  }),

  // ── closeTab ─────────────────────────────────────────────────────────────
  on(WorkspaceActions.closeTab, (state, { tabId, groupId }) => {
    const idx = groupIndex(state, groupId);
    if (idx < 0) return state;

    const group = state.tabGroups[idx];
    const tabIdx = group.tabs.findIndex((t) => t.id === tabId);
    if (tabIdx < 0) return state;

    // Pinned tabs are protected from accidental close.
    if (group.tabs[tabIdx].pinned) return state;

    const newTabs = group.tabs.filter((t) => t.id !== tabId);

    // Resolve the next active tab.
    let newActiveTabId = group.activeTabId;
    if (group.activeTabId === tabId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIdx > 0) {
        newActiveTabId = newTabs[tabIdx - 1].id;
      } else {
        newActiveTabId = newTabs[0].id;
      }
    }

    const groups = [...state.tabGroups] as TabGroupState[];
    groups[idx] = { ...group, tabs: newTabs, activeTabId: newActiveTabId };
    return { ...state, tabGroups: groups };
  }),

  // ── selectTab ────────────────────────────────────────────────────────────
  on(WorkspaceActions.selectTab, (state, { tabId, groupId }) =>
    updateGroup(state, groupId, (g) => ({ ...g, activeTabId: tabId }))
  ),

  // ── reorderTab ───────────────────────────────────────────────────────────
  on(WorkspaceActions.reorderTab, (state, { groupId, fromIndex, toIndex }) =>
    updateGroup(state, groupId, (group) => {
      const tabs = [...group.tabs] as TabItem[];
      if (fromIndex < 0 || fromIndex >= tabs.length) return group;
      if (toIndex < 0 || toIndex >= tabs.length) return group;
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { ...group, tabs };
    })
  ),

  // ── setTabDirty ──────────────────────────────────────────────────────────
  on(WorkspaceActions.setTabDirty, (state, { tabId, dirty }) => {
    const idx = state.tabGroups.findIndex((g) => g.tabs.some((t) => t.id === tabId));
    if (idx < 0) return state;
    return updateGroup(state, state.tabGroups[idx].groupId, (g) => ({
      ...g,
      tabs: g.tabs.map((t) => (t.id === tabId ? { ...t, dirty } : t)),
    }));
  }),

  // ── setTabPinned ─────────────────────────────────────────────────────────
  on(WorkspaceActions.setTabPinned, (state, { tabId, pinned }) => {
    const idx = state.tabGroups.findIndex((g) => g.tabs.some((t) => t.id === tabId));
    if (idx < 0) return state;
    return updateGroup(state, state.tabGroups[idx].groupId, (g) => ({
      ...g,
      tabs: g.tabs.map((t) => (t.id === tabId ? { ...t, pinned } : t)),
    }));
  }),

  // ── assignGroupToZone ────────────────────────────────────────────────────
  on(WorkspaceActions.assignGroupToZone, (state, { groupId, zone }) =>
    updateGroup(state, groupId, (g) => ({ ...g, zone }))
  )
);
