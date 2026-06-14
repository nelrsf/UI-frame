import { ShellTab } from '../../../shell/contracts/ShellTab';
import { WithDraggable } from '../../../shell/models/tab-item.model';
import { DockZone } from '../../models/dock-zone-assignment.model';
import {
  closeTab,
  moveTabToZone,
  openTab,
  registerAndOpenTab,
  registerTab,
  removeTab,
  reorderTab,
  selectTab,
  setTabDirty,
  setTabPinned,
} from './workspace.actions';
import { initialWorkspaceState, workspaceReducer } from './workspace.reducer';

function makeTab(partial: Partial<ShellTab & WithDraggable> & { id: string; label: string }): ShellTab & WithDraggable {
  return {
    id: partial.id,
    label: partial.label,
    icon: partial.icon,
    component: partial.component ?? class {},
    closeable: partial.closeable,
    pinnable: partial.pinnable,
    draggable: partial.draggable,
  } as ShellTab & WithDraggable;
}

function openInZone(
  state = initialWorkspaceState,
  tab: ShellTab,
  zone = DockZone.PrimaryTopLeftWorkspace
) {
  return workspaceReducer(
    workspaceReducer(state, registerTab({ tab })),
    openTab({ tab, zone })
  );
}

function ids(state: ReturnType<typeof workspaceReducer>, zone: DockZone): string[] {
  return [...(state.tabsByZone.get(zone) ?? [])].map((tab) => tab.id);
}

describe('workspace reducer', () => {
  it('returns the initial state for unknown actions', () => {
    expect(workspaceReducer(undefined, { type: '__unknown__' })).toEqual(initialWorkspaceState);
  });

  it('starts with empty registered tabs and per-zone maps', () => {
    expect(initialWorkspaceState.registeredTabs).toEqual([]);
    expect(initialWorkspaceState.tabsByZone.size).toBe(0);
    expect(initialWorkspaceState.activeTabIdsByZone.size).toBe(0);
  });

  describe('registerTab/openTab', () => {
    it('registers without opening', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const state = workspaceReducer(initialWorkspaceState, registerTab({ tab }));

      expect(state.registeredTabs).toContain(tab);
      expect(state.tabsByZone.size).toBe(0);
    });

    it('does not duplicate registered tabs', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const state = workspaceReducer(
        workspaceReducer(initialWorkspaceState, registerTab({ tab })),
        registerTab({ tab })
      );

      expect(state.registeredTabs).toEqual([tab]);
    });

    it('opens a registered tab in the requested zone and activates it there', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const state = openInZone(initialWorkspaceState, tab, DockZone.PrimaryTopRightWorkspace);

      expect(state.tabsByZone.get(DockZone.PrimaryTopRightWorkspace)).toEqual([tab]);
      expect(state.activeTabIdsByZone.get(DockZone.PrimaryTopRightWorkspace)).toBe('tab-1');
    });

    it('only activates when opening an already-open tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const opened = openInZone(initialWorkspaceState, tab);
      const state = workspaceReducer(opened, openTab({ tab, zone: DockZone.PrimaryTopLeftWorkspace }));

      expect(state.tabsByZone.get(DockZone.PrimaryTopLeftWorkspace)).toEqual([tab]);
      expect(state.activeTabIdsByZone.get(DockZone.PrimaryTopLeftWorkspace)).toBe('tab-1');
    });

    it('does not open an unregistered tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      spyOn(console, 'warn');

      const state = workspaceReducer(initialWorkspaceState, openTab({ tab, zone: DockZone.PrimaryTopLeftWorkspace }));

      expect(console.warn).toHaveBeenCalled();
      expect(state).toEqual(initialWorkspaceState);
    });

    it('registers and opens in one action', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const state = workspaceReducer(
        initialWorkspaceState,
        registerAndOpenTab({ tab, zone: DockZone.BottomCenterPanel })
      );

      expect(state.registeredTabs).toContain(tab);
      expect(state.tabsByZone.get(DockZone.BottomCenterPanel)).toEqual([tab]);
      expect(state.activeTabIdsByZone.get(DockZone.BottomCenterPanel)).toBe('tab-1');
    });
  });

  describe('selection and removal', () => {
    it('selects an open tab in its current zone', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      let state = openInZone(initialWorkspaceState, tab1);
      state = openInZone(state, tab2);

      state = workspaceReducer(state, selectTab({ tabId: 'tab-1' }));

      expect(state.activeTabIdsByZone.get(DockZone.PrimaryTopLeftWorkspace)).toBe('tab-1');
    });

    it('leaves state unchanged when selecting a registered but closed tab', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const registered = workspaceReducer(initialWorkspaceState, registerTab({ tab }));

      expect(workspaceReducer(registered, selectTab({ tabId: 'tab-1' }))).toEqual(registered);
    });

    it('closes an open closeable tab at index 0', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts', closeable: { dirty: false } });
      const opened = openInZone(initialWorkspaceState, tab);

      const state = workspaceReducer(opened, closeTab({ tabId: 'tab-1' }));

      expect(state.tabsByZone.get(DockZone.PrimaryTopLeftWorkspace)).toEqual([]);
      expect(state.activeTabIdsByZone.get(DockZone.PrimaryTopLeftWorkspace)).toBeNull();
      expect(state.registeredTabs).toContain(tab);
    });

    it('activates the adjacent tab when closing the active tab', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts', closeable: { dirty: false } });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts', closeable: { dirty: false } });
      let state = openInZone(initialWorkspaceState, tab1);
      state = openInZone(state, tab2);

      state = workspaceReducer(state, closeTab({ tabId: 'tab-2' }));

      expect(ids(state, DockZone.PrimaryTopLeftWorkspace)).toEqual(['tab-1']);
      expect(state.activeTabIdsByZone.get(DockZone.PrimaryTopLeftWorkspace)).toBe('tab-1');
    });

    it('does not close tabs without closeable capability', () => {
      const tab = makeTab({ id: 'tab-1', label: 'ReadOnly.ts' });
      const opened = openInZone(initialWorkspaceState, tab);

      expect(workspaceReducer(opened, closeTab({ tabId: 'tab-1' }))).toEqual(opened);
    });

    it('does not close pinned tabs', () => {
      const tab = makeTab({
        id: 'tab-1',
        label: 'Pinned.ts',
        closeable: { dirty: false },
        pinnable: { pinned: true },
      });
      const opened = openInZone(initialWorkspaceState, tab);

      expect(workspaceReducer(opened, closeTab({ tabId: 'tab-1' }))).toEqual(opened);
    });

    it('removes a tab from open and registered collections', () => {
      const tab = makeTab({ id: 'tab-1', label: 'File.ts' });
      const opened = openInZone(initialWorkspaceState, tab);

      const state = workspaceReducer(opened, removeTab({ tabId: 'tab-1' }));

      expect(state.registeredTabs).toEqual([]);
      expect(state.tabsByZone.get(DockZone.PrimaryTopLeftWorkspace)).toEqual([]);
    });
  });

  describe('reorderTab', () => {
    it('reorders tabs within one zone', () => {
      const tab1 = makeTab({ id: 'tab-1', label: 'A.ts' });
      const tab2 = makeTab({ id: 'tab-2', label: 'B.ts' });
      const tab3 = makeTab({ id: 'tab-3', label: 'C.ts' });
      let state = openInZone(initialWorkspaceState, tab1);
      state = openInZone(state, tab2);
      state = openInZone(state, tab3);

      state = workspaceReducer(
        state,
        reorderTab({ zone: DockZone.PrimaryTopLeftWorkspace, toIndex: 0, reorderedTab: tab3 })
      );

      expect(ids(state, DockZone.PrimaryTopLeftWorkspace)).toEqual(['tab-3', 'tab-1', 'tab-2']);
    });

    it('does not reorder when target index is invalid', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts' });
      const opened = openInZone(initialWorkspaceState, tab);

      const state = workspaceReducer(
        opened,
        reorderTab({ zone: DockZone.PrimaryTopLeftWorkspace, toIndex: 10, reorderedTab: tab })
      );

      expect(state).toEqual(opened);
    });
  });

  describe('tab metadata updates', () => {
    it('sets dirty on closeable tabs', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts', closeable: { dirty: false } });
      const opened = openInZone(initialWorkspaceState, tab);

      const state = workspaceReducer(opened, setTabDirty({ tabId: 'tab-1', dirty: true }));

      expect((state.tabsByZone.get(DockZone.PrimaryTopLeftWorkspace)?.[0] as any).closeable.dirty).toBeTrue();
    });

    it('sets pinned on pinnable tabs', () => {
      const tab = makeTab({ id: 'tab-1', label: 'A.ts', pinnable: { pinned: false } });
      const opened = openInZone(initialWorkspaceState, tab);

      const state = workspaceReducer(opened, setTabPinned({ tabId: 'tab-1', pinned: true }));

      expect((state.tabsByZone.get(DockZone.PrimaryTopLeftWorkspace)?.[0] as any).pinnable.pinned).toBeTrue();
    });
  });

  describe('moveTabToZone', () => {
    it('moves a draggable tab between zones and activates it in the target', () => {
      const tab = makeTab({
        id: 'tab-1',
        label: 'File.ts',
        draggable: {
          sourceZone: DockZone.PrimaryTopLeftWorkspace,
          targetZone: DockZone.BottomCenterPanel,
          allowableDropTargets: [DockZone.BottomCenterPanel],
          reorderTargetIndex: null,
        },
      });
      const opened = openInZone(initialWorkspaceState, tab, DockZone.PrimaryTopLeftWorkspace);

      const state = workspaceReducer(
        opened,
        moveTabToZone({
          tabId: 'tab-1',
          sourceZone: DockZone.PrimaryTopLeftWorkspace,
          targetZone: DockZone.BottomCenterPanel,
          tabMetadata: tab,
        })
      );

      expect(ids(state, DockZone.PrimaryTopLeftWorkspace)).toEqual([]);
      expect(ids(state, DockZone.BottomCenterPanel)).toEqual(['tab-1']);
      expect(state.activeTabIdsByZone.get(DockZone.BottomCenterPanel)).toBe('tab-1');
      expect((state.tabsByZone.get(DockZone.BottomCenterPanel)?.[0] as any).draggable.sourceZone).toBe(
        DockZone.BottomCenterPanel
      );
    });

    it('inserts a moved tab at reorderTargetIndex when provided', () => {
      const targetTab = makeTab({ id: 'existing', label: 'Existing' });
      const moved = makeTab({
        id: 'moved',
        label: 'Moved',
        draggable: {
          sourceZone: DockZone.PrimaryTopLeftWorkspace,
          targetZone: DockZone.BottomCenterPanel,
          allowableDropTargets: [DockZone.BottomCenterPanel],
          reorderTargetIndex: 0,
        },
      });
      let state = openInZone(initialWorkspaceState, moved, DockZone.PrimaryTopLeftWorkspace);
      state = openInZone(state, targetTab, DockZone.BottomCenterPanel);

      state = workspaceReducer(
        state,
        moveTabToZone({
          tabId: 'moved',
          sourceZone: DockZone.PrimaryTopLeftWorkspace,
          targetZone: DockZone.BottomCenterPanel,
          tabMetadata: moved,
        })
      );

      expect(ids(state, DockZone.BottomCenterPanel)).toEqual(['moved', 'existing']);
    });

    it('does not move when the provided source zone is stale', () => {
      const tab = makeTab({
        id: 'tab-1',
        label: 'File.ts',
        draggable: {
          sourceZone: DockZone.PrimaryTopLeftWorkspace,
          targetZone: DockZone.BottomCenterPanel,
          allowableDropTargets: [DockZone.BottomCenterPanel],
          reorderTargetIndex: null,
        },
      });
      const opened = openInZone(initialWorkspaceState, tab, DockZone.PrimaryTopLeftWorkspace);

      const state = workspaceReducer(
        opened,
        moveTabToZone({
          tabId: 'tab-1',
          sourceZone: DockZone.SecondaryPanel,
          targetZone: DockZone.BottomCenterPanel,
          tabMetadata: tab,
        })
      );

      expect(state).toEqual(opened);
    });
  });
});
