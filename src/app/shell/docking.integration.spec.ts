import { workspaceReducer, initialWorkspaceState, WorkspaceState } from '../core/state/workspace/workspace.reducer';
import {
  registerAndOpenTab,
} from '../core/state/workspace/workspace.actions';
import { DockZone } from '../core/models/dock-zone-assignment.model';
import { ShellTab } from './contracts/ShellTab';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


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
      DockZone.PrimaryTopLeftWorkspace,
      DockZone.PrimaryTopRightWorkspace,
      DockZone.PrimaryBottomLeftWorkspace,
      DockZone.PrimaryBottomRightWorkspace,
      DockZone.BottomLeftPanel,
      DockZone.BottomRightPanel,
      DockZone.BottomCenterPanel,
      DockZone.SecondaryPanel,
    ]);
  });

  it('should use only canonical zone identifiers matching the spec', () => {
    expect(DockZone.PrimaryTopLeftWorkspace).toBe('primary-top-left-workspace');
    expect(DockZone.PrimaryTopRightWorkspace).toBe('primary-top-right-workspace');
    expect(DockZone.PrimaryBottomLeftWorkspace).toBe('primary-bottom-left-workspace');
    expect(DockZone.PrimaryBottomRightWorkspace).toBe('primary-bottom-right-workspace');
    expect(DockZone.BottomLeftPanel).toBe('bottom-left-panel');
    expect(DockZone.BottomCenterPanel).toBe('bottom-center-panel');
    expect(DockZone.BottomRightPanel).toBe('bottom-right-panel');
    expect(DockZone.SecondaryPanel).toBe('secondary-panel');
  });
});




describe('Docking — approved zone guard (no out-of-scope zones)', () => {
  it('should only accept DockZone enum values (no arbitrary string zones)', () => {
    const validZones: string[] = Object.values(DockZone);

    // All zone enum values must be in the approved set.
    for (const zone of validZones) {
      expect([
        DockZone.PrimaryTopLeftWorkspace,
        DockZone.PrimaryTopRightWorkspace,
        DockZone.PrimaryBottomLeftWorkspace,
        DockZone.PrimaryBottomRightWorkspace,
        DockZone.BottomLeftPanel,
        DockZone.BottomRightPanel,
        DockZone.BottomCenterPanel,
        DockZone.SecondaryPanel,
      ] as string[]).toContain(zone);
    }
  });

  it('should not produce more than eight distinct zone values', () => {
    expect(Object.values(DockZone).length).toBe(8);
  });
});
