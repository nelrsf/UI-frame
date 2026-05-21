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
  /** All tabs ever registered in this group (never removed by closeTab). */
  readonly registeredTabs: readonly TabItem[];
  /** Ordered list of currently open tabs. Order matches the visual display order. */
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

  // ── registerTab ───────────────────────────────────────────────────────────
  on(WorkspaceActions.registerTab, (state, { tab }) => {
    const idx = groupIndex(state, tab.groupId);

    if (idx >= 0) {
      const group = state.tabGroups[idx];
      // Tab already present in group — no-op.
      if (group.tabs.some((t) => t.id === tab.id)) {
        return state;
      }
      // Append to existing group without activating.
      const groups = [...state.tabGroups] as TabGroupState[];
      groups[idx] = {
        ...group,
        registeredTabs: group.registeredTabs.some((t) => t.id === tab.id)
          ? group.registeredTabs
          : [...group.registeredTabs, tab],
        tabs: [...group.tabs, tab],
      };
      return { ...state, tabGroups: groups };
    }

    // Create a new group assigned to PrimaryWorkspace by default.
    return {
      ...state,
      tabGroups: [
        ...state.tabGroups,
        {
          groupId: tab.groupId,
          registeredTabs: [tab],
          tabs: [tab],
          activeTabId: null,
          zone: DockZone.PrimaryWorkspace,
        },
      ],
    };
  }),

  // ── openTab ──────────────────────────────────────────────────────────────
  on(WorkspaceActions.openTab, (state, { tab }) => {
    const idx = groupIndex(state, tab.groupId);

    if (idx >= 0) {
      const group = state.tabGroups[idx];
      // Tab already present — just activate it.
      if (group.tabs.some((t) => t.id === tab.id)) {
        return updateGroup(state, tab.groupId, (g) => ({ ...g, activeTabId: tab.id }));
      }
      // Tab registered but not currently open — add to tabs and activate.
      const groups = [...state.tabGroups] as TabGroupState[];
      groups[idx] = { ...group, tabs: [...group.tabs, tab], activeTabId: tab.id };
      return { ...state, tabGroups: groups };
    }

    // Tab not registered in any group — no-op with warning.
    console.warn(
      `[Workspace] openTab: tab '${tab.id}' not registered. Call registerTab first.`
    );
    return state;
  }),

  // ── registerAndOpenTab ───────────────────────────────────────────────────
  on(WorkspaceActions.registerAndOpenTab, (state, { tab }) => {
    // Step 1: Apply registerTab logic.
    let intermediate = state;
    const groupIdx = groupIndex(intermediate, tab.groupId);

    if (groupIdx >= 0) {
      const group = intermediate.tabGroups[groupIdx];
      if (!group.tabs.some((t) => t.id === tab.id)) {
        const groups = [...intermediate.tabGroups] as TabGroupState[];
        groups[groupIdx] = {
          ...group,
          registeredTabs: group.registeredTabs.some((t) => t.id === tab.id)
            ? group.registeredTabs
            : [...group.registeredTabs, tab],
          tabs: [...group.tabs, tab],
        };
        intermediate = { ...intermediate, tabGroups: groups };
      }
    } else {
      intermediate = {
        ...intermediate,
        tabGroups: [
          ...intermediate.tabGroups,
          {
            groupId: tab.groupId,
            registeredTabs: [tab],
            tabs: [tab],
            activeTabId: null,
            zone: DockZone.PrimaryWorkspace,
          },
        ],
      };
    }

    // Step 2: Apply openTab logic (activate the tab).
    const finalIdx = groupIndex(intermediate, tab.groupId);
    if (finalIdx >= 0) {
      const groups = [...intermediate.tabGroups] as TabGroupState[];
      groups[finalIdx] = { ...groups[finalIdx], activeTabId: tab.id };
      return { ...intermediate, tabGroups: groups };
    }

    return intermediate;
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
      if (toIndex < 0 || toIndex > tabs.length) return group;
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
  ),

  // ── removeTab ────────────────────────────────────────────────────────────
  on(WorkspaceActions.removeTab, (state, { tabId, groupId }) => {
    const idx = groupIndex(state, groupId);
    if (idx < 0) return state;

    const group = state.tabGroups[idx];
    const tabIdx = group.tabs.findIndex((t) => t.id === tabId);
    if (tabIdx < 0) return state;

    const newTabs = group.tabs.filter((t) => t.id !== tabId);
    const newRegisteredTabs = group.registeredTabs.filter((t) => t.id !== tabId);

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
    groups[idx] = { ...group, tabs: newTabs, registeredTabs: newRegisteredTabs, activeTabId: newActiveTabId };
    return { ...state, tabGroups: groups };
  }),

  // ── moveTabToZone ────────────────────────────────────────────────────────
  on(WorkspaceActions.moveTabToZone, (state, { tabId, sourceGroupId, sourceZone, targetZone, tabMetadata }) => {
    // Step 1: Remove the tab from the source group (inline removeTab logic).
    const srcIdx = groupIndex(state, sourceGroupId);
    if (srcIdx < 0) return state;

    const srcGroup = state.tabGroups[srcIdx];
    const tabIdx = srcGroup.tabs.findIndex((t) => t.id === tabId);
    if (tabIdx < 0) return state;

    const newTabs = srcGroup.tabs.filter((t) => t.id !== tabId);
    const newRegisteredTabs = srcGroup.registeredTabs.filter((t) => t.id !== tabId);

    let newActiveTabId = srcGroup.activeTabId;
    if (srcGroup.activeTabId === tabId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIdx > 0) {
        newActiveTabId = newTabs[tabIdx - 1].id;
      } else {
        newActiveTabId = newTabs[0].id;
      }
    }

    const groupsAfterRemove = [...state.tabGroups] as TabGroupState[];
    groupsAfterRemove[srcIdx] = { ...srcGroup, tabs: newTabs, registeredTabs: newRegisteredTabs, activeTabId: newActiveTabId };
    let intermediate: WorkspaceState = { ...state, tabGroups: groupsAfterRemove };

    // Step 2: If target is PrimaryWorkspace, add the tab to the target group.
    if (targetZone === DockZone.PrimaryWorkspace) {
      const targetIdx = groupIndex(intermediate, tabMetadata.groupId);
      if (targetIdx >= 0) {
        const targetGroup = intermediate.tabGroups[targetIdx];
        if (!targetGroup.tabs.some((t) => t.id === tabMetadata.id)) {
          const groups = [...intermediate.tabGroups] as TabGroupState[];
          groups[targetIdx] = {
            ...targetGroup,
            registeredTabs: targetGroup.registeredTabs.some((t) => t.id === tabMetadata.id)
              ? targetGroup.registeredTabs
              : [...targetGroup.registeredTabs, tabMetadata],
            tabs: [...targetGroup.tabs, tabMetadata],
            activeTabId: tabMetadata.id,
          };
          intermediate = { ...intermediate, tabGroups: groups };
        } else {
          const groups = [...intermediate.tabGroups] as TabGroupState[];
          groups[targetIdx] = { ...targetGroup, activeTabId: tabMetadata.id };
          intermediate = { ...intermediate, tabGroups: groups };
        }
      } else {
        intermediate = {
          ...intermediate,
          tabGroups: [
            ...intermediate.tabGroups,
            {
              groupId: tabMetadata.groupId,
              registeredTabs: [tabMetadata],
              tabs: [tabMetadata],
              activeTabId: tabMetadata.id,
              zone: DockZone.PrimaryWorkspace,
            },
          ],
        };
      }
    }
    // For BottomPanel/SecondaryPanel targets, the caller (DragDropService)
    // must register the tab in the target region via ShellManager.

    return intermediate;
  })
);
