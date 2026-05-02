import {
  workspaceReducer,
  initialWorkspaceState,
  WorkspaceState,
  TabGroupState,
} from './workspace.reducer';
import {
  openTab,
  closeTab,
  selectTab,
  reorderTab,
  setTabDirty,
  setTabPinned,
  assignGroupToZone,
} from './workspace.actions';
import {
  selectTabGroups,
  selectTabGroupById,
  selectTabsForGroup,
  selectActiveTabId,
  selectGroupsByZone,
} from './workspace.selectors';
import { TabItem } from '../../../shell/models/tab-item.model';
import { DockZone } from '../../models/dock-zone-assignment.model';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeTab(partial: Partial<TabItem> & { id: string; label: string }): TabItem {
  return {
    dirty: false,
    closable: true,
    pinned: false,
    groupId: 'main',
    ...partial,
  };
}

function applyActions(actions: { type: string }[]) {
  return actions.reduce(
    (state, action) => workspaceReducer(state, action),
    initialWorkspaceState
  );
}

// ---------------------------------------------------------------------------
// workspace reducer — initial state
// ---------------------------------------------------------------------------

describe('workspace reducer', () => {
  describe('initial state', () => {
    it('should return the initial state for unknown actions', () => {
      const state = workspaceReducer(undefined, { type: '__unknown__' });
      expect(state).toEqual(initialWorkspaceState);
    });

    it('should start with an empty tabGroups array', () => {
      expect(initialWorkspaceState.tabGroups).toEqual([]);
    });
  });

  // ── openTab ───────────────────────────────────────────────────────────────

  describe('openTab', () => {
    it('should create a new group when no group with the given groupId exists', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', groupId: 'main' });
      const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));

      expect(state.tabGroups.length).toBe(1);
      expect(state.tabGroups[0].groupId).toBe('main');
    });

    it('should default new groups to the PrimaryWorkspace zone', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', groupId: 'main' });
      const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));

      expect(state.tabGroups[0].zone).toBe(DockZone.PrimaryWorkspace);
    });

    it('should add the tab to a newly created group', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', groupId: 'main' });
      const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));

      expect(state.tabGroups[0].tabs).toEqual([tab]);
    });

    it('should make the opened tab the active tab in a new group', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', groupId: 'main' });
      const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));

      expect(state.tabGroups[0].activeTabId).toBe('tab-1');
    });

    it('should append the tab to an existing group and activate it', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, openTab({ tab: tab1 }));
      const s2 = workspaceReducer(s1, openTab({ tab: tab2 }));

      expect(s2.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-2']);
      expect(s2.tabGroups[0].activeTabId).toBe('tab-2');
    });

    it('should only activate (not duplicate) a tab that is already open', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, openTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab: tab2 }));
      const s3 = workspaceReducer(s2, openTab({ tab })); // reopen tab-1

      expect(s3.tabGroups[0].tabs.length).toBe(2);
      expect(s3.tabGroups[0].activeTabId).toBe('tab-1');
    });

    it('should create independent groups for different groupIds', () => {
      const tabA = makeTab({ id: 'tab-a', label: 'A.ts', groupId: 'grp-a' });
      const tabB = makeTab({ id: 'tab-b', label: 'B.ts', groupId: 'grp-b' });
      const s1 = workspaceReducer(initialWorkspaceState, openTab({ tab: tabA }));
      const s2 = workspaceReducer(s1, openTab({ tab: tabB }));

      expect(s2.tabGroups.length).toBe(2);
      expect(s2.tabGroups.find((g) => g.groupId === 'grp-a')?.tabs.length).toBe(1);
      expect(s2.tabGroups.find((g) => g.groupId === 'grp-b')?.tabs.length).toBe(1);
    });
  });

  // ── closeTab ──────────────────────────────────────────────────────────────

  describe('closeTab', () => {
    function stateWithTabs(...labels: string[]): WorkspaceState {
      return labels.reduce(
        (state, label, i) =>
          workspaceReducer(
            state,
            openTab({ tab: makeTab({ id: `tab-${i + 1}`, label, groupId: 'main' }) })
          ),
        initialWorkspaceState
      );
    }

    it('should remove the specified tab from its group', () => {
      const state = stateWithTabs('A.ts', 'B.ts', 'C.ts');
      const next = workspaceReducer(state, closeTab({ tabId: 'tab-2', groupId: 'main' }));

      expect(next.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-3']);
    });

    it('should activate the left-adjacent tab when the active tab is closed', () => {
      const state = stateWithTabs('A.ts', 'B.ts', 'C.ts');
      // select tab-2 first so we know what is active
      const withActive = workspaceReducer(state, selectTab({ tabId: 'tab-2', groupId: 'main' }));
      const next = workspaceReducer(withActive, closeTab({ tabId: 'tab-2', groupId: 'main' }));

      expect(next.tabGroups[0].activeTabId).toBe('tab-1');
    });

    it('should activate the right-adjacent tab when closing the first tab', () => {
      const state = stateWithTabs('A.ts', 'B.ts', 'C.ts');
      const withActive = workspaceReducer(state, selectTab({ tabId: 'tab-1', groupId: 'main' }));
      const next = workspaceReducer(withActive, closeTab({ tabId: 'tab-1', groupId: 'main' }));

      expect(next.tabGroups[0].activeTabId).toBe('tab-2');
    });

    it('should set activeTabId to null when the last tab in a group is closed', () => {
      const state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'only', label: 'Solo.ts' }) })
      );
      const next = workspaceReducer(state, closeTab({ tabId: 'only', groupId: 'main' }));

      expect(next.tabGroups[0].activeTabId).toBeNull();
      expect(next.tabGroups[0].tabs.length).toBe(0);
    });

    it('should not change the active tab when a non-active tab is closed', () => {
      const state = stateWithTabs('A.ts', 'B.ts');
      // tab-2 is active because it was opened last
      const next = workspaceReducer(state, closeTab({ tabId: 'tab-1', groupId: 'main' }));

      expect(next.tabGroups[0].activeTabId).toBe('tab-2');
    });

    it('should not remove a pinned tab', () => {
      const tab = makeTab({ id: 'pinned', label: 'Pinned.ts', pinned: true });
      const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));
      const next = workspaceReducer(state, closeTab({ tabId: 'pinned', groupId: 'main' }));

      expect(next.tabGroups[0].tabs.length).toBe(1);
    });

    it('should be a no-op for an unknown tabId', () => {
      const state = stateWithTabs('A.ts');
      const next = workspaceReducer(state, closeTab({ tabId: 'ghost', groupId: 'main' }));

      expect(next).toEqual(state);
    });

    it('should be a no-op for an unknown groupId', () => {
      const state = stateWithTabs('A.ts');
      const next = workspaceReducer(state, closeTab({ tabId: 'tab-1', groupId: 'nonexistent' }));

      expect(next).toEqual(state);
    });
  });

  // ── selectTab ─────────────────────────────────────────────────────────────

  describe('selectTab', () => {
    it('should set the active tab in the specified group', () => {
      const s1 = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'a', label: 'A.ts' }) })
      );
      const s2 = workspaceReducer(s1, openTab({ tab: makeTab({ id: 'b', label: 'B.ts' }) }));
      const s3 = workspaceReducer(s2, selectTab({ tabId: 'a', groupId: 'main' }));

      expect(s3.tabGroups[0].activeTabId).toBe('a');
    });

    it('should not affect tabs in other groups', () => {
      const tabA = makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' });
      const tabB = makeTab({ id: 'b', label: 'B.ts', groupId: 'grp-b' });
      const s1 = workspaceReducer(initialWorkspaceState, openTab({ tab: tabA }));
      const s2 = workspaceReducer(s1, openTab({ tab: tabB }));
      const s3 = workspaceReducer(s2, selectTab({ tabId: 'a', groupId: 'grp-a' }));

      expect(s3.tabGroups.find((g) => g.groupId === 'grp-b')?.activeTabId).toBe('b');
    });

    it('should be a no-op for an unknown groupId', () => {
      const state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'a', label: 'A.ts' }) })
      );
      const next = workspaceReducer(state, selectTab({ tabId: 'a', groupId: 'ghost' }));

      expect(next).toEqual(state);
    });
  });

  // ── reorderTab ────────────────────────────────────────────────────────────

  describe('reorderTab', () => {
    function stateWithThreeTabs(): WorkspaceState {
      return [
        makeTab({ id: 'tab-1', label: 'A.ts' }),
        makeTab({ id: 'tab-2', label: 'B.ts' }),
        makeTab({ id: 'tab-3', label: 'C.ts' }),
      ].reduce(
        (state, tab) => workspaceReducer(state, openTab({ tab })),
        initialWorkspaceState
      );
    }

    it('should move a tab from fromIndex to toIndex', () => {
      const state = stateWithThreeTabs();
      const next = workspaceReducer(state, reorderTab({ groupId: 'main', fromIndex: 0, toIndex: 2 }));

      expect(next.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-2', 'tab-3', 'tab-1']);
    });

    it('should move a tab right to left', () => {
      const state = stateWithThreeTabs();
      const next = workspaceReducer(state, reorderTab({ groupId: 'main', fromIndex: 2, toIndex: 0 }));

      expect(next.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-3', 'tab-1', 'tab-2']);
    });

    it('should be a no-op when fromIndex equals toIndex', () => {
      const state = stateWithThreeTabs();
      const next = workspaceReducer(state, reorderTab({ groupId: 'main', fromIndex: 1, toIndex: 1 }));

      expect(next.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-2', 'tab-3']);
    });

    it('should not change the active tab after reorder', () => {
      const state = stateWithThreeTabs();
      const withActive = workspaceReducer(state, selectTab({ tabId: 'tab-2', groupId: 'main' }));
      const next = workspaceReducer(
        withActive,
        reorderTab({ groupId: 'main', fromIndex: 1, toIndex: 0 })
      );

      expect(next.tabGroups[0].activeTabId).toBe('tab-2');
    });

    it('should be a no-op for an out-of-range fromIndex', () => {
      const state = stateWithThreeTabs();
      const next = workspaceReducer(state, reorderTab({ groupId: 'main', fromIndex: 99, toIndex: 0 }));

      expect(next.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-2', 'tab-3']);
    });

    it('should be a no-op for an out-of-range toIndex', () => {
      const state = stateWithThreeTabs();
      const next = workspaceReducer(state, reorderTab({ groupId: 'main', fromIndex: 0, toIndex: 99 }));

      expect(next.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-2', 'tab-3']);
    });
  });

  // ── setTabDirty ───────────────────────────────────────────────────────────

  describe('setTabDirty', () => {
    it('should set dirty to true on the target tab', () => {
      const state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );
      const next = workspaceReducer(state, setTabDirty({ tabId: 'tab-1', dirty: true }));

      expect(next.tabGroups[0].tabs[0].dirty).toBeTrue();
    });

    it('should set dirty to false on the target tab', () => {
      const s1 = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts', dirty: true }) })
      );
      const next = workspaceReducer(s1, setTabDirty({ tabId: 'tab-1', dirty: false }));

      expect(next.tabGroups[0].tabs[0].dirty).toBeFalse();
    });

    it('should not affect other tabs in the same group', () => {
      const s1 = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );
      const s2 = workspaceReducer(
        s1,
        openTab({ tab: makeTab({ id: 'tab-2', label: 'B.ts' }) })
      );
      const next = workspaceReducer(s2, setTabDirty({ tabId: 'tab-1', dirty: true }));

      expect(next.tabGroups[0].tabs.find((t) => t.id === 'tab-2')?.dirty).toBeFalse();
    });

    it('should be a no-op for an unknown tabId', () => {
      const state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );
      const next = workspaceReducer(state, setTabDirty({ tabId: 'ghost', dirty: true }));

      expect(next).toEqual(state);
    });
  });

  // ── setTabPinned ──────────────────────────────────────────────────────────

  describe('setTabPinned', () => {
    it('should pin a tab', () => {
      const state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );
      const next = workspaceReducer(state, setTabPinned({ tabId: 'tab-1', pinned: true }));

      expect(next.tabGroups[0].tabs[0].pinned).toBeTrue();
    });

    it('should unpin a tab', () => {
      const s1 = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts', pinned: true }) })
      );
      const next = workspaceReducer(s1, setTabPinned({ tabId: 'tab-1', pinned: false }));

      expect(next.tabGroups[0].tabs[0].pinned).toBeFalse();
    });

    it('should protect a freshly pinned tab from close', () => {
      const s1 = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );
      const s2 = workspaceReducer(s1, setTabPinned({ tabId: 'tab-1', pinned: true }));
      const s3 = workspaceReducer(s2, closeTab({ tabId: 'tab-1', groupId: 'main' }));

      expect(s3.tabGroups[0].tabs.length).toBe(1);
    });

    it('should allow a freshly unpinned tab to be closed', () => {
      const s1 = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts', pinned: true }) })
      );
      const s2 = workspaceReducer(s1, setTabPinned({ tabId: 'tab-1', pinned: false }));
      const s3 = workspaceReducer(s2, closeTab({ tabId: 'tab-1', groupId: 'main' }));

      expect(s3.tabGroups[0].tabs.length).toBe(0);
    });
  });

  // ── assignGroupToZone ─────────────────────────────────────────────────────

  describe('assignGroupToZone', () => {
    it('should reassign a group from PrimaryWorkspace to BottomPanel', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, openTab({ tab }));
      const s2 = workspaceReducer(
        s1,
        assignGroupToZone({ groupId: 'main', zone: DockZone.BottomPanel })
      );

      expect(s2.tabGroups[0].zone).toBe(DockZone.BottomPanel);
    });

    it('should reassign a group to SecondaryPanel', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, openTab({ tab }));
      const s2 = workspaceReducer(
        s1,
        assignGroupToZone({ groupId: 'main', zone: DockZone.SecondaryPanel })
      );

      expect(s2.tabGroups[0].zone).toBe(DockZone.SecondaryPanel);
    });

    it('should not affect other groups when assigning a zone', () => {
      const tabA = makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' });
      const tabB = makeTab({ id: 'b', label: 'B.ts', groupId: 'grp-b' });
      const s1 = workspaceReducer(initialWorkspaceState, openTab({ tab: tabA }));
      const s2 = workspaceReducer(s1, openTab({ tab: tabB }));
      const s3 = workspaceReducer(
        s2,
        assignGroupToZone({ groupId: 'grp-a', zone: DockZone.BottomPanel })
      );

      expect(s3.tabGroups.find((g) => g.groupId === 'grp-b')?.zone).toBe(
        DockZone.PrimaryWorkspace
      );
    });

    it('should be a no-op for an unknown groupId', () => {
      const state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );
      const next = workspaceReducer(
        state,
        assignGroupToZone({ groupId: 'ghost', zone: DockZone.BottomPanel })
      );

      expect(next).toEqual(state);
    });
  });

  // ── full tab lifecycle sequence ───────────────────────────────────────────

  describe('full tab lifecycle', () => {
    it('should support a complete open → select → dirty → close lifecycle', () => {
      // Open two tabs
      let state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );
      state = workspaceReducer(
        state,
        openTab({ tab: makeTab({ id: 'tab-2', label: 'B.ts' }) })
      );

      // Select first tab
      state = workspaceReducer(state, selectTab({ tabId: 'tab-1', groupId: 'main' }));
      expect(state.tabGroups[0].activeTabId).toBe('tab-1');

      // Mark it dirty
      state = workspaceReducer(state, setTabDirty({ tabId: 'tab-1', dirty: true }));
      expect(state.tabGroups[0].tabs[0].dirty).toBeTrue();

      // Close it — adjacent tab becomes active
      state = workspaceReducer(state, closeTab({ tabId: 'tab-1', groupId: 'main' }));
      expect(state.tabGroups[0].tabs.length).toBe(1);
      expect(state.tabGroups[0].activeTabId).toBe('tab-2');
    });

    it('should support open → pin → attempt close (blocked) → unpin → close', () => {
      let state = workspaceReducer(
        initialWorkspaceState,
        openTab({ tab: makeTab({ id: 'tab-1', label: 'A.ts' }) })
      );

      state = workspaceReducer(state, setTabPinned({ tabId: 'tab-1', pinned: true }));
      // Close attempt — should be blocked
      state = workspaceReducer(state, closeTab({ tabId: 'tab-1', groupId: 'main' }));
      expect(state.tabGroups[0].tabs.length).toBe(1);

      state = workspaceReducer(state, setTabPinned({ tabId: 'tab-1', pinned: false }));
      state = workspaceReducer(state, closeTab({ tabId: 'tab-1', groupId: 'main' }));
      expect(state.tabGroups[0].tabs.length).toBe(0);
    });

    it('should preserve tab order across multiple opens and one close in the middle', () => {
      const tabs = ['A', 'B', 'C', 'D'].map((l, i) =>
        makeTab({ id: `tab-${i + 1}`, label: `${l}.ts` })
      );
      let state = tabs.reduce(
        (s, tab) => workspaceReducer(s, openTab({ tab })),
        initialWorkspaceState
      );

      state = workspaceReducer(state, closeTab({ tabId: 'tab-2', groupId: 'main' }));

      expect(state.tabGroups[0].tabs.map((t) => t.id)).toEqual(['tab-1', 'tab-3', 'tab-4']);
    });
  });
});

// ---------------------------------------------------------------------------
// workspace selectors
// ---------------------------------------------------------------------------

describe('workspace selectors', () => {
  const tabA: TabItem = makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' });
  const tabB: TabItem = makeTab({ id: 'b', label: 'B.ts', groupId: 'grp-b' });

  const groupA: TabGroupState = {
    groupId: 'grp-a',
    tabs: [tabA],
    activeTabId: 'a',
    zone: DockZone.PrimaryWorkspace,
  };
  const groupB: TabGroupState = {
    groupId: 'grp-b',
    tabs: [tabB],
    activeTabId: 'b',
    zone: DockZone.BottomPanel,
  };

  const rootState = {
    workspace: {
      tabGroups: [groupA, groupB],
    } as WorkspaceState,
  };

  it('selectTabGroups should return all tab groups', () => {
    expect(selectTabGroups(rootState)).toEqual([groupA, groupB]);
  });

  it('selectTabGroupById should return the matching group', () => {
    expect(selectTabGroupById('grp-a')(rootState)).toEqual(groupA);
  });

  it('selectTabGroupById should return null for an unknown groupId', () => {
    expect(selectTabGroupById('ghost')(rootState)).toBeNull();
  });

  it('selectTabsForGroup should return the tabs of the group', () => {
    expect(selectTabsForGroup('grp-a')(rootState)).toEqual([tabA]);
  });

  it('selectTabsForGroup should return an empty array for an unknown groupId', () => {
    expect(selectTabsForGroup('ghost')(rootState)).toEqual([]);
  });

  it('selectActiveTabId should return the active tab id of the group', () => {
    expect(selectActiveTabId('grp-a')(rootState)).toBe('a');
  });

  it('selectActiveTabId should return null for an unknown groupId', () => {
    expect(selectActiveTabId('ghost')(rootState)).toBeNull();
  });

  it('selectGroupsByZone should return only groups assigned to PrimaryWorkspace', () => {
    expect(selectGroupsByZone(DockZone.PrimaryWorkspace)(rootState)).toEqual([groupA]);
  });

  it('selectGroupsByZone should return only groups assigned to BottomPanel', () => {
    expect(selectGroupsByZone(DockZone.BottomPanel)(rootState)).toEqual([groupB]);
  });

  it('selectGroupsByZone should return an empty array for a zone with no groups', () => {
    expect(selectGroupsByZone(DockZone.SecondaryPanel)(rootState)).toEqual([]);
  });
});
