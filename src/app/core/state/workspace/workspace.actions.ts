import { createAction, props } from '@ngrx/store';
import { ShellTab } from '../../../shell/contracts/ShellTab';
import { DockZone } from '../../models/dock-zone-assignment.model';
import { WithDraggable } from '../../../shell/models/tab-item.model';

/**
 * Registers a tab in the workspace state without making it active or visible.
 * If the tab is already present in the central region the action is a no-op.
 */
export const registerTab = createAction('[Workspace] Register Tab', props<{ tab: ShellTab }>());

/**
 * Opens (activates and displays) a tab that is already registered in the workspace.
 * If the tab is already present in the central region, only activates it.
 * If the tab is not registered, the action is a no-op.
 */
export const openTab = createAction(
  '[Workspace] Open Tab', 
  props<{ tab: ShellTab; zone: DockZone }>()
);

/**
 * Convenience facade that registers and immediately opens a tab.
 * Equivalent to dispatching `registerTab` followed by `openTab`.
 */
export const registerAndOpenTab = createAction(
  '[Workspace] Register And Open Tab',
  props<{ tab: ShellTab; zone: DockZone }>()
);

/**
 * Closes the central region tab identified by `tabId`.
 * Pinned tabs are ignored — they cannot be closed through this action.
 * If the closed tab was active, the adjacent tab (preferring the one to the
 * left) becomes active.
 */
export const closeTab = createAction(
  '[Workspace] Close Tab',
  props<{ tabId: string }>()
);

/**
 * Activates the central region tab identified by `tabId`.
 */
export const selectTab = createAction(
  '[Workspace] Select Tab',
  props<{ tabId: string }>()
);

/**
 * Reorders a central region tab by moving it from `fromIndex` to `toIndex`.
 * The workspaceId is included for future multi-workspace support.
 * No-ops when either index is out of range.
 */
export const reorderTab = createAction(
  '[Workspace] Reorder Tab',
  props<{ zone: DockZone; toIndex: number | null; reorderedTab: ShellTab & WithDraggable }>()
);

/**
 * Updates the `dirty` flag on a single tab (identified across all groups by `tabId`).
 */
export const setTabDirty = createAction(
  '[Workspace] Set Tab Dirty',
  props<{ tabId: string; dirty: boolean }>()
);

/**
 * Updates the `pinned` flag on a single tab (identified across all groups by `tabId`).
 */
export const setTabPinned = createAction(
  '[Workspace] Set Tab Pinned',
  props<{ tabId: string; pinned: boolean }>()
);

/**
 * Removes a central region tab from both `tabs` and `registeredTabs`.
 * If the removed tab was active, the adjacent tab (preferring left) becomes active.
 */
export const removeTab = createAction(
  '[Workspace] Remove Tab',
  props<{ tabId: string }>()
);

/**
 * Moves a tab from its source zone to a target zone.
 * The tab is removed from the source zone and, if the target is PrimaryWorkspace,
 * added to the central region. For BottomPanel/SecondaryPanel targets, the caller
 * must register the tab in the target region via ShellManager.
 */
export const moveTabToZone = createAction(
  '[Workspace] Move Tab To Zone',
  props<{
    tabId: string;
    sourceZone: DockZone;
    targetZone: DockZone;
    tabMetadata: ShellTab & WithDraggable;
  }>()
);

