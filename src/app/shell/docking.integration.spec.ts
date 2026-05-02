import { workspaceReducer, initialWorkspaceState, WorkspaceState } from '../core/state/workspace/workspace.reducer';
import {
  openTab,
  closeTab,
  selectTab,
  assignGroupToZone,
} from '../core/state/workspace/workspace.actions';
import {
  selectGroupsByZone,
  selectTabGroupById,
  selectActiveTabId,
  selectTabsForGroup,
} from '../core/state/workspace/workspace.selectors';
import { TabItem } from './models/tab-item.model';
import { DockZone } from '../core/models/dock-zone-assignment.model';

// ---------------------------------------------------------------------------
// Helpers
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

function applyActions(
  actions: { type: string }[]
): WorkspaceState {
  return actions.reduce(
    (state, action) => workspaceReducer(state, action),
    initialWorkspaceState
  );
}

function rootState(workspace: WorkspaceState) {
  return { workspace };
}

// ---------------------------------------------------------------------------
// Docking integration tests
// ---------------------------------------------------------------------------

/**
 * Shell v1 MVP docking integration tests.
 *
 * These tests verify that:
 *  - Only the three approved MVP zones are used (FR-Docking).
 *  - Tab groups can be assigned to and moved between zones.
 *  - Zone assignments are independent per group.
 *  - Zone visibility state is correctly initialised.
 *  - Selectors correctly project zone-filtered group lists.
 *  - Tab lifecycle (open / close / select) works correctly in non-primary zones.
 */
describe('Docking — MVP zone enforcement (FR-Docking)', () => {
  it('should define exactly three approved MVP dock zones', () => {
    const zones = Object.values(DockZone);
    expect(zones).toEqual([
      DockZone.PrimaryWorkspace,
      DockZone.BottomPanel,
      DockZone.SecondaryPanel,
    ]);
  });

  it('should use only canonical zone identifiers matching the spec', () => {
    expect(DockZone.PrimaryWorkspace).toBe('primary-workspace');
    expect(DockZone.BottomPanel).toBe('bottom-panel');
    expect(DockZone.SecondaryPanel).toBe('secondary-panel');
  });
});

describe('Docking — default zone assignment', () => {
  it('should assign a new group to PrimaryWorkspace by default', () => {
    const tab = makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' });
    const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));

    expect(state.tabGroups[0].zone).toBe(DockZone.PrimaryWorkspace);
  });

  it('should place a group in the PrimaryWorkspace result set immediately after creation', () => {
    const tab = makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' });
    const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));

    const primaryGroups = selectGroupsByZone(DockZone.PrimaryWorkspace)(rootState(state));
    expect(primaryGroups.map((g) => g.groupId)).toContain('grp-a');
  });
});

describe('Docking — zone reassignment', () => {
  it('should move a group from PrimaryWorkspace to BottomPanel', () => {
    let state = workspaceReducer(
      initialWorkspaceState,
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' }) })
    );
    state = workspaceReducer(
      state,
      assignGroupToZone({ groupId: 'grp-a', zone: DockZone.BottomPanel })
    );

    expect(state.tabGroups[0].zone).toBe(DockZone.BottomPanel);
    expect(selectGroupsByZone(DockZone.BottomPanel)(rootState(state)).length).toBe(1);
    expect(selectGroupsByZone(DockZone.PrimaryWorkspace)(rootState(state)).length).toBe(0);
  });

  it('should move a group from PrimaryWorkspace to SecondaryPanel', () => {
    let state = workspaceReducer(
      initialWorkspaceState,
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' }) })
    );
    state = workspaceReducer(
      state,
      assignGroupToZone({ groupId: 'grp-a', zone: DockZone.SecondaryPanel })
    );

    expect(state.tabGroups[0].zone).toBe(DockZone.SecondaryPanel);
    expect(selectGroupsByZone(DockZone.SecondaryPanel)(rootState(state)).length).toBe(1);
  });

  it('should move a group from BottomPanel back to PrimaryWorkspace', () => {
    const state = applyActions([
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' }) }),
      assignGroupToZone({ groupId: 'grp-a', zone: DockZone.BottomPanel }),
      assignGroupToZone({ groupId: 'grp-a', zone: DockZone.PrimaryWorkspace }),
    ]);

    expect(state.tabGroups[0].zone).toBe(DockZone.PrimaryWorkspace);
  });

  it('should not affect groups in other zones when one group is reassigned', () => {
    const state = applyActions([
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' }) }),
      openTab({ tab: makeTab({ id: 'b', label: 'B.ts', groupId: 'grp-b' }) }),
      assignGroupToZone({ groupId: 'grp-a', zone: DockZone.BottomPanel }),
    ]);

    const grpB = state.tabGroups.find((g) => g.groupId === 'grp-b');
    expect(grpB?.zone).toBe(DockZone.PrimaryWorkspace);
  });
});

describe('Docking — multiple groups per zone', () => {
  it('should allow multiple groups to coexist in the same zone', () => {
    const state = applyActions([
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' }) }),
      openTab({ tab: makeTab({ id: 'b', label: 'B.ts', groupId: 'grp-b' }) }),
    ]);

    const primaryGroups = selectGroupsByZone(DockZone.PrimaryWorkspace)(rootState(state));
    expect(primaryGroups.length).toBe(2);
  });

  it('should correctly list one group per zone when each is assigned differently', () => {
    const state = applyActions([
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'grp-a' }) }),
      openTab({ tab: makeTab({ id: 'b', label: 'B.ts', groupId: 'grp-b' }) }),
      openTab({ tab: makeTab({ id: 'c', label: 'C.ts', groupId: 'grp-c' }) }),
      assignGroupToZone({ groupId: 'grp-b', zone: DockZone.BottomPanel }),
      assignGroupToZone({ groupId: 'grp-c', zone: DockZone.SecondaryPanel }),
    ]);

    expect(selectGroupsByZone(DockZone.PrimaryWorkspace)(rootState(state)).length).toBe(1);
    expect(selectGroupsByZone(DockZone.BottomPanel)(rootState(state)).length).toBe(1);
    expect(selectGroupsByZone(DockZone.SecondaryPanel)(rootState(state)).length).toBe(1);
  });
});

describe('Docking — tab lifecycle within non-primary zones', () => {
  it('should support opening and selecting a tab in the BottomPanel zone', () => {
    const state = applyActions([
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'panel' }) }),
      openTab({ tab: makeTab({ id: 'b', label: 'B.ts', groupId: 'panel' }) }),
      assignGroupToZone({ groupId: 'panel', zone: DockZone.BottomPanel }),
      selectTab({ tabId: 'a', groupId: 'panel' }),
    ]);

    expect(selectActiveTabId('panel')(rootState(state))).toBe('a');
    expect(state.tabGroups.find((g) => g.groupId === 'panel')?.zone).toBe(DockZone.BottomPanel);
  });

  it('should support closing a tab in the SecondaryPanel zone and activating the adjacent tab', () => {
    const state = applyActions([
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'secondary' }) }),
      openTab({ tab: makeTab({ id: 'b', label: 'B.ts', groupId: 'secondary' }) }),
      assignGroupToZone({ groupId: 'secondary', zone: DockZone.SecondaryPanel }),
      selectTab({ tabId: 'b', groupId: 'secondary' }),
      closeTab({ tabId: 'b', groupId: 'secondary' }),
    ]);

    expect(selectActiveTabId('secondary')(rootState(state))).toBe('a');
    expect(selectTabsForGroup('secondary')(rootState(state)).length).toBe(1);
  });

  it('should preserve zone assignment after tabs are added and closed', () => {
    const state = applyActions([
      openTab({ tab: makeTab({ id: 'a', label: 'A.ts', groupId: 'grp' }) }),
      assignGroupToZone({ groupId: 'grp', zone: DockZone.BottomPanel }),
      openTab({ tab: makeTab({ id: 'b', label: 'B.ts', groupId: 'grp' }) }),
      closeTab({ tabId: 'a', groupId: 'grp' }),
    ]);

    expect(state.tabGroups.find((g) => g.groupId === 'grp')?.zone).toBe(DockZone.BottomPanel);
  });
});

describe('Docking — approved zone guard (no out-of-scope zones)', () => {
  it('should only accept DockZone enum values (no arbitrary string zones)', () => {
    const validZones: string[] = Object.values(DockZone);

    // All zone enum values must be in the approved set.
    for (const zone of validZones) {
      expect([
        DockZone.PrimaryWorkspace,
        DockZone.BottomPanel,
        DockZone.SecondaryPanel,
      ] as string[]).toContain(zone);
    }
  });

  it('should not produce more than three distinct zone values', () => {
    expect(Object.values(DockZone).length).toBe(3);
  });
});
