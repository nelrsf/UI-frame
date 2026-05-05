import { createAction, props } from '@ngrx/store';
import { Type } from '@angular/core';
import { TabItem } from '../../../shell/models/tab-item.model';
import { SidebarItem } from '../../../shell/models/sidebar-item.model';
import { ToolbarAction } from '../../../shell/models/toolbar-action.model';
import { PanelTab } from '../../../shell/models/panel-tab.model';

/**
 * Add a tab to the shell's central content region.
 * Props include the TabItem and the Angular component Type to render.
 */
export const addShellTab = createAction(
  '[Shell Content] Add Shell Tab',
  props<{ tabItem: TabItem; componentType: Type<unknown> }>()
);

/**
 * Set the active tab by id in the shell's central region.
 */
export const setActiveShellTab = createAction(
  '[Shell Content] Set Active Shell Tab',
  props<{ id: string }>()
);

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
