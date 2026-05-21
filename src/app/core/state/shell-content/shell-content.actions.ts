import { createAction, props } from '@ngrx/store';
import { Type } from '@angular/core';
import { TabItem, TabCloseGuard } from '../../../shell/models/tab-item.model';
import { SidebarItem } from '../../../shell/models/sidebar-item.model';
import { ToolbarAction } from '../../../shell/models/toolbar-action.model';
import { PanelTab } from '../../../shell/models/panel-tab.model';
import { SecondaryPanelEntry } from '../../../shell/models/secondary-panel-entry.model';

/**
 * Add a sidebar entry to the activity bar.
 */
export const addSidebarEntry = createAction(
  '[Shell Content] Add Sidebar Entry',
  props<SidebarItem>()
);

/**
 * Add a toolbar action (button) to the toolbar region.
 */
export const addToolbarAction = createAction(
  '[Shell Content] Add Toolbar Action',
  props<ToolbarAction>()
);

/**
 * Add a bottom panel entry (tab) to the bottom panel.
 */
export const addBottomPanelEntry = createAction(
  '[Shell Content] Add Bottom Panel Entry',
  props<PanelTab>()
);

/**
 * Add an entry to the shell's secondary panel region.
 */
export const addSecondaryPanelEntry = createAction(
  '[Shell Content] Add Secondary Panel Entry',
  props<{ entry: SecondaryPanelEntry }>()
);

/**
 * Set active secondary panel entry by id.
 */
export const setActiveSecondaryPanelEntry = createAction(
  '[Shell Content] Set Active Secondary Panel Entry',
  props<{ id: string }>()
);

/**
 * Removes a bottom panel entry by id.
 */
export const removeBottomPanelEntry = createAction(
  '[Shell Content] Remove Bottom Panel Entry',
  props<{ entryId: string }>()
);

/**
 * Removes a secondary panel entry by id.
 */
export const removeSecondaryPanelEntry = createAction(
  '[Shell Content] Remove Secondary Panel Entry',
  props<{ entryId: string }>()
);

/**
 * Reorders bottom panel tabs by moving a tab from one index to another.
 */
export const reorderBottomPanelTabs = createAction(
  '[Shell Content] Reorder Bottom Panel Tabs',
  props<{ fromIndex: number; toIndex: number }>()
);

/**
 * Reorders secondary panel entries by moving an entry from one index to another.
 */
export const reorderSecondaryPanelEntries = createAction(
  '[Shell Content] Reorder Secondary Panel Entries',
  props<{ fromIndex: number; toIndex: number }>()
);
