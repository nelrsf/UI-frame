import { createAction, props } from '@ngrx/store';
import { SidebarItem } from '../../../shell/models/sidebar-item.model';
import { ToolbarAction } from '../../../shell/models/toolbar-action.model';

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
