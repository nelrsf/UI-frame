import { createAction, props } from '@ngrx/store';
import { TabItem } from '../../../shell/models/tab-item.model';
import { DockZone } from '../../models/dock-zone-assignment.model';

/**
 * Registers a tab in the workspace state without making it active or visible.
 * If the group does not yet exist it is created and assigned to the
 * `PrimaryWorkspace` zone by default.
 * If the tab is already present in the group the action is a no-op.
 */
export const registerTab = createAction('[Workspace] Register Tab', props<{ tab: TabItem }>());

/**
 * Opens (activates and displays) a tab that is already registered in the workspace.
 * If the tab is already present in its group, only activates it.
 * If the tab is not registered, the action is a no-op.
 */
export const openTab = createAction('[Workspace] Open Tab', props<{ tab: TabItem }>());

/**
 * Convenience facade that registers and immediately opens a tab.
 * Equivalent to dispatching `registerTab` followed by `openTab`.
 */
export const registerAndOpenTab = createAction(
  '[Workspace] Register And Open Tab',
  props<{ tab: TabItem }>()
);

/**
 * Closes the tab identified by `tabId` inside `groupId`.
 * Pinned tabs are ignored — they cannot be closed through this action.
 * If the closed tab was active, the adjacent tab (preferring the one to the
 * left) becomes active.
 */
export const closeTab = createAction(
  '[Workspace] Close Tab',
  props<{ tabId: string; groupId: string }>()
);

/**
 * Activates the tab identified by `tabId` inside `groupId`.
 */
export const selectTab = createAction(
  '[Workspace] Select Tab',
  props<{ tabId: string; groupId: string }>()
);

/**
 * Reorders a tab within a group by moving it from `fromIndex` to `toIndex`.
 * No-ops when either index is out of range.
 */
export const reorderTab = createAction(
  '[Workspace] Reorder Tab',
  props<{ groupId: string; fromIndex: number; toIndex: number }>()
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
 * Reassigns a tab group to one of the three supported MVP dock zones.
 * Docking v1 allows only `PrimaryWorkspace`, `BottomPanel`, and `SecondaryPanel`.
 */
export const assignGroupToZone = createAction(
  '[Workspace] Assign Group To Zone',
  props<{ groupId: string; zone: DockZone }>()
);
