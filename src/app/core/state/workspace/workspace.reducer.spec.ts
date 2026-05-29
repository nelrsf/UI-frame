import { workspaceReducer, initialWorkspaceState, WorkspaceState } from './workspace.reducer';
import {
  registerTab,
  openTab,
  registerAndOpenTab,
  closeTab,
  selectTab,
  reorderTab,
  setTabDirty,
  setTabPinned,
  removeTab,
  moveTabToZone,
  addBottomPanelEntry,
  removeBottomPanelEntry,
  addSecondaryPanelEntry,
  removeSecondaryPanelEntry,
} from './workspace.actions';
import { ShellTab } from '../../../shell/contracts/ShellTab';
import { DockZone } from '../../models/dock-zone-assignment.model';
import { IDraggable } from '../../../shell/models/tab-item.model';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeTab(partial: any): ShellTab {
  return {
    id: partial.id,
    label: partial.label,
    component: partial.component,
    icon: partial.icon,
    draggable: partial.draggable,
    closeable: partial.closeable,
    pinnable: partial.pinnable,
  } as ShellTab;
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

    it('should start with empty tabs and registeredTabs', () => {
      expect(initialWorkspaceState.tabs).toEqual([]);
      expect(initialWorkspaceState.registeredTabs).toEqual([]);
      expect(initialWorkspaceState.activeTabId).toBeNull();
    });

    it('should start with empty bottom panel and secondary panel entries', () => {
      expect(initialWorkspaceState.bottomPanelTabs).toEqual([]);
      expect(initialWorkspaceState.secondaryPanelEntries).toEqual([]);
      expect(initialWorkspaceState.activeSecondaryPanelEntryId).toBeNull();
    });
  });

  // ── registerTab ───────────────────────────────────────────────────────────

  describe('registerTab', () => {
    it('should add a tab to registeredTabs without opening it', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const state = workspaceReducer(initialWorkspaceState, registerTab({ tab }));

      expect(state.registeredTabs).toContain(tab);
      expect(state.tabs).toEqual([]);
      expect(state.activeTabId).toBeNull();
    });

    it('should not add duplicate tabs to registeredTabs', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, registerTab({ tab }));

      expect(s2.registeredTabs.length).toBe(1);
    });

    it('should handle registering multiple tabs', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab: tab1 }));
      const s2 = workspaceReducer(s1, registerTab({ tab: tab2 }));

      expect(s2.registeredTabs.length).toBe(2);
      expect(s2.tabs).toEqual([]);
    });
  });

  // ── openTab ─────────────────────────────────────────────────────────────

  describe('openTab', () => {
    it('should activate and open a registered tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab }));

      expect(s2.tabs).toContain(tab);
      expect(s2.activeTabId).toBe('tab-1');
    });

    it('should just activate a tab if it is already open', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab }));
      const s3 = workspaceReducer(s2, openTab({ tab }));

      expect(s3.tabs.length).toBe(1);
      expect(s3.activeTabId).toBe('tab-1');
    });

    it('should warn if opening an unregistered tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      spyOn(console, 'warn');
      const state = workspaceReducer(initialWorkspaceState, openTab({ tab }));

      expect(console.warn).toHaveBeenCalled();
      expect(state).toEqual(initialWorkspaceState);
    });
  });

  // ── registerAndOpenTab ───────────────────────────────────────────────────

  describe('registerAndOpenTab', () => {
    it('should register and open a tab in one action', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const state = workspaceReducer(initialWorkspaceState, registerAndOpenTab({ tab }));

      expect(state.registeredTabs).toContain(tab);
      expect(state.tabs).toContain(tab);
      expect(state.activeTabId).toBe('tab-1');
    });
  });

  // ── selectTab ────────────────────────────────────────────────────────────

  describe('selectTab', () => {
    it('should activate an open tab', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab: tab1 }));
      const s2 = workspaceReducer(s1, registerTab({ tab: tab2 }));
      const s3 = workspaceReducer(s2, openTab({ tab: tab1 }));
      const s4 = workspaceReducer(s3, openTab({ tab: tab2 }));
      const s5 = workspaceReducer(s4, selectTab({ tabId: 'tab-1' }));

      expect(s5.activeTabId).toBe('tab-1');
    });

    it('should not change state if tab is not open', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, selectTab({ tabId: 'tab-1' }));

      expect(s2).toEqual(s1);
    });
  });

  // ── closeTab ─────────────────────────────────────────────────────────────

  describe('closeTab', () => {
    it('should close an open tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab }));
      const s3 = workspaceReducer(s2, closeTab({ tabId: 'tab-1' }));

      expect(s3.tabs.length).toBe(0);
      expect(s3.activeTabId).toBeNull();
      expect(s3.registeredTabs).toContain(tab);
    });

    it('should activate the adjacent tab when closing the active tab', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab: tab1 }));
      const s2 = workspaceReducer(s1, registerTab({ tab: tab2 }));
      const s3 = workspaceReducer(s2, openTab({ tab: tab1 }));
      const s4 = workspaceReducer(s3, openTab({ tab: tab2 }));
      const s5 = workspaceReducer(s4, closeTab({ tabId: 'tab-2' }));

      expect(s5.activeTabId).toBe('tab-1');
      expect(s5.tabs.map((t) => t.id)).toEqual(['tab-1']);
    });

    it('should not close a non-closeable tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts'});
      let nonCloseableTab = makeTab({ id: 'tab-2', label: 'ReadOnly.ts', closeable: undefined }) as any;
      delete nonCloseableTab.closeable;
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, registerTab({ tab: nonCloseableTab }));
      const s3 = workspaceReducer(s2, openTab({ tab }));
      const s4 = workspaceReducer(s3, openTab({ tab: nonCloseableTab }));
      const s5 = workspaceReducer(s4, closeTab({ tabId: 'tab-2' }));

      expect(s5.tabs.length).toBe(2);
    });

    it('should not close a pinned tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', pinnable: { pinned: true } });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab }));
      const s3 = workspaceReducer(s2, closeTab({ tabId: 'tab-1' }));

      expect(s3.tabs.length).toBe(1);
      expect(s3.activeTabId).toBe('tab-1');
    });
  });

  // ── removeTab ────────────────────────────────────────────────────────────

  describe('removeTab', () => {
    it('should remove a tab from both tabs and registeredTabs', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab }));
      const s3 = workspaceReducer(s2, removeTab({ tabId: 'tab-1' }));

      expect(s3.tabs.length).toBe(0);
      expect(s3.registeredTabs.length).toBe(0);
    });

    it('should not affect state if tab does not exist', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, removeTab({ tabId: 'nonexistent' }));

      expect(s2).toEqual(s1);
    });

    it('should activate adjacent tab when removing active tab', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab: tab1 }));
      const s2 = workspaceReducer(s1, registerTab({ tab: tab2 }));
      const s3 = workspaceReducer(s2, openTab({ tab: tab1 }));
      const s4 = workspaceReducer(s3, openTab({ tab: tab2 }));
      const s5 = workspaceReducer(s4, removeTab({ tabId: 'tab-2' }));

      expect(s5.activeTabId).toBe('tab-1');
    });
  });

  // ── reorderTab ───────────────────────────────────────────────────────────

  describe('reorderTab', () => {
    it('should reorder tabs within the tabs list', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const tab3 = makeTab({ id: 'tab-3', label: 'C.ts' });
      let state = initialWorkspaceState;
      state = workspaceReducer(state, registerTab({ tab: tab1 }));
      state = workspaceReducer(state, registerTab({ tab: tab2 }));
      state = workspaceReducer(state, registerTab({ tab: tab3 }));
      state = workspaceReducer(state, openTab({ tab: tab1 }));
      state = workspaceReducer(state, openTab({ tab: tab2 }));
      state = workspaceReducer(state, openTab({ tab: tab3 }));

      // Move tab3 (index 2) to index 0
      state = workspaceReducer(state, reorderTab({ workspaceId: 'main', fromIndex: 2, toIndex: 0 }));

      expect(state.tabs.map((t) => t.id)).toEqual(['tab-3', 'tab-1', 'tab-2']);
    });

    it('should not reorder if indices are out of range', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab }));
      const s3 = workspaceReducer(s2, reorderTab({ workspaceId: 'main', fromIndex: 5, toIndex: 0 }));

      expect(s3).toEqual(s2);
    });

    it('should not reorder if fromIndex equals toIndex', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts' });
      const s1 = workspaceReducer(initialWorkspaceState, registerTab({ tab }));
      const s2 = workspaceReducer(s1, openTab({ tab }));
      const s3 = workspaceReducer(s2, reorderTab({ workspaceId: 'main', fromIndex: 0, toIndex: 0 }));

      expect(s3).toEqual(s2);
    });
  });


  // ── Bottom Panel Entries ─────────────────────────────────────────────────

  describe('Bottom Panel Entries', () => {
it('should add a bottom panel entry', () => {
  const tab = makeTab({ id: 'logs-1', label: 'Logs' });
  const state = workspaceReducer(initialWorkspaceState, addBottomPanelEntry({ tab }));

  expect(state.bottomPanelTabs).toContain(tab);
});

it('should not add duplicate bottom panel entries', () => {
  const tab = makeTab({ id: 'logs-1', label: 'Logs' });
  spyOn(console, 'warn');
  let state = initialWorkspaceState;
  state = workspaceReducer(state, addBottomPanelEntry({ tab }));
  state = workspaceReducer(state, addBottomPanelEntry({ tab }));

  expect(state.bottomPanelTabs.length).toBe(1);
  expect(console.warn).toHaveBeenCalled();
});

it('should remove a bottom panel entry', () => {
  const tab = makeTab({ id: 'logs-1', label: 'Logs' });
  let state = initialWorkspaceState;
  state = workspaceReducer(state, addBottomPanelEntry({ tab }));
  state = workspaceReducer(state, removeBottomPanelEntry({ entryId: 'logs-1' }));

  expect(state.bottomPanelTabs.length).toBe(0);
});

it('should not affect state when removing non-existent bottom panel entry', () => {
  const tab = makeTab({ id: 'logs-1', label: 'Logs' });
  let state = initialWorkspaceState;
  state = workspaceReducer(state, addBottomPanelEntry({ tab }));
  const s2 = workspaceReducer(state, removeBottomPanelEntry({ entryId: 'nonexistent' }));

  expect(s2).toEqual(state);
});
  });

  // ── Secondary Panel Entries ──────────────────────────────────────────────

  describe('Secondary Panel Entries', () => {
    it('should add a secondary panel entry', () => {
      const tab = makeTab({ id: 'outline-1', label: 'Outline' });
      const state = workspaceReducer(initialWorkspaceState, addSecondaryPanelEntry({ entry: tab }));

      expect(state.secondaryPanelEntries).toContain(tab);
    });

    it('should not add duplicate secondary panel entries', () => {
      const tab = makeTab({ id: 'outline-1', label: 'Outline' });
      spyOn(console, 'warn');
      let state = initialWorkspaceState;
      state = workspaceReducer(state, addSecondaryPanelEntry({ entry: tab }));
      state = workspaceReducer(state, addSecondaryPanelEntry({ entry: tab }));

      expect(state.secondaryPanelEntries.length).toBe(1);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should set active secondary panel entry when adding', () => {
      const tab = makeTab({ id: 'outline-1', label: 'Outline' });
      const state = workspaceReducer(initialWorkspaceState, addSecondaryPanelEntry({ entry: tab }));

      expect(state.activeSecondaryPanelEntryId).toBe('outline-1');
    });

    it('should remove a secondary panel entry', () => {
      const tab = makeTab({ id: 'outline-1', label: 'Outline' });
      let state = initialWorkspaceState;
      state = workspaceReducer(state, addSecondaryPanelEntry({ entry: tab }));
      state = workspaceReducer(state, removeSecondaryPanelEntry({ entryId: 'outline-1' }));

      expect(state.secondaryPanelEntries.length).toBe(0);
    });

    it('should not affect state when removing non-existent secondary panel entry', () => {
      const tab = makeTab({ id: 'outline-1', label: 'Outline' });
      let state = initialWorkspaceState;
      state = workspaceReducer(state, addSecondaryPanelEntry({ entry: tab }));
      const s2 = workspaceReducer(state, removeSecondaryPanelEntry({ entryId: 'nonexistent' }));

      expect(s2).toEqual(state);
    });
  });

  // ── moveTabToZone ────────────────────────────────────────────────────────

  describe('moveTabToZone', () => {
    it('should move a tab from PrimaryWorkspace to BottomPanel', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', draggable: { sourceZone: DockZone.PrimaryWorkspace, targetZone: DockZone.BottomPanel, allowableDropTargets: [DockZone.BottomPanel] } });
      let state = initialWorkspaceState;
      state = workspaceReducer(state, registerTab({ tab }));
      state = workspaceReducer(state, openTab({ tab }));

      state = workspaceReducer(
        state,
        moveTabToZone({
          tabId: 'tab-1',
          sourceZone: DockZone.PrimaryWorkspace,
          targetZone: DockZone.BottomPanel,
          tabMetadata: tab,
        })
      );

      expect(state.tabs.length).toBe(0);
      expect(state.bottomPanelTabs).toContain(tab);
    });

it('should move a tab from BottomPanel to PrimaryWorkspace', () => {
  const tab = makeTab({ id: 'tab-1', label: 'File.ts', draggable: { sourceZone: DockZone.BottomPanel, targetZone: DockZone.PrimaryWorkspace, allowableDropTargets: [DockZone.PrimaryWorkspace] } });
  let state = initialWorkspaceState;
  state = workspaceReducer(state, addBottomPanelEntry({ tab }));

      state = workspaceReducer(
        state,
        moveTabToZone({
          tabId: 'tab-1',
          sourceZone: DockZone.BottomPanel,
          targetZone: DockZone.PrimaryWorkspace,
          tabMetadata: tab,
        })
      );

      expect(state.bottomPanelTabs.length).toBe(0);
      expect(state.tabs).toContain(tab);
      expect(state.activeTabId).toBe('tab-1');
    });

    it('should move a tab from PrimaryWorkspace to SecondaryPanel', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', draggable: { sourceZone: DockZone.PrimaryWorkspace, targetZone: DockZone.SecondaryPanel, allowableDropTargets: [DockZone.SecondaryPanel] } });
      let state = initialWorkspaceState;
      state = workspaceReducer(state, registerTab({ tab }));
      state = workspaceReducer(state, openTab({ tab }));

      state = workspaceReducer(
        state,
        moveTabToZone({
          tabId: 'tab-1',
          sourceZone: DockZone.PrimaryWorkspace,
          targetZone: DockZone.SecondaryPanel,
          tabMetadata: tab,
        })
      );

      expect(state.tabs.length).toBe(0);
      expect(state.secondaryPanelEntries).toContain(tab);
      expect(state.activeSecondaryPanelEntryId).toBe('tab-1');
    });
  });

  // ── Integration Tests ────────────────────────────────────────────────────

  describe('Integration', () => {
    it('should handle a complete workflow: register, open, modify, and close tabs', () => {
      const tab1 = makeTab({ id: 'file1', label: 'main.ts' });
      const tab2 = makeTab({ id: 'file2', label: 'utils.ts' });

      let state = initialWorkspaceState;

      // Register and open tabs
      state = workspaceReducer(state, registerAndOpenTab({ tab: tab1 }));
      state = workspaceReducer(state, registerTab({ tab: tab2 }));
      state = workspaceReducer(state, openTab({ tab: tab2 }));

      expect(state.tabs.length).toBe(2);
      expect(state.activeTabId).toBe('file2');

      // Close the dirty tab
      state = workspaceReducer(state, closeTab({ tabId: 'file2' }));
      expect(state.activeTabId).toBe('file1');
      expect(state.tabs.length).toBe(1);

      // Reopen the closed tab
      state = workspaceReducer(state, openTab({ tab: tab2 }));
      expect(state.tabs.length).toBe(2);
      expect(state.registeredTabs.length).toBe(2);
    });

it('should handle moving tabs between zones', () => {
  const centralTab = makeTab({ id: 'central', label: 'Main', draggable: { sourceZone: DockZone.PrimaryWorkspace, targetZone: DockZone.BottomPanel, allowableDropTargets: [DockZone.BottomPanel, DockZone.PrimaryWorkspace] } });
  const bottomTab = makeTab({ id: 'bottom', label: 'Logs' });

  let state = initialWorkspaceState;
  state = workspaceReducer(state, registerAndOpenTab({ tab: centralTab }));
  state = workspaceReducer(state, addBottomPanelEntry({ tab: bottomTab }));

      // Move from central to bottom
      state = workspaceReducer(
        state,
        moveTabToZone({
          tabId: 'central',
          sourceZone: DockZone.PrimaryWorkspace,
          targetZone: DockZone.BottomPanel,
          tabMetadata: centralTab,
        })
      );

      expect(state.tabs.length).toBe(0);
      expect(state.bottomPanelTabs.length).toBe(2);

      // Move from bottom back to central
      state = workspaceReducer(
        state,
        moveTabToZone({
          tabId: 'central',
          sourceZone: DockZone.BottomPanel,
          targetZone: DockZone.PrimaryWorkspace,
          tabMetadata: centralTab,
        })
      );

      expect(state.tabs.length).toBe(1);
      expect(state.bottomPanelTabs.length).toBe(1);
      expect(state.activeTabId).toBe('central');
    });
  });
});
