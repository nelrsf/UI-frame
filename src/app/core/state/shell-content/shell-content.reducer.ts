import { createReducer, on, Action } from '@ngrx/store';
import { SidebarItem } from '../../../shell/models/sidebar-item.model';
import { ToolbarAction } from '../../../shell/models/toolbar-action.model';
import * as ShellContentActions from './shell-content.actions';

/**
 * Shell content state shape (sidebar and toolbar only).
 * Panel state (bottom panel tabs, secondary panel entries) has been moved
 * to the workspace slice.
 */
export interface ShellContentState {
  sidebarItems: SidebarItem[];
  toolbarActions: ToolbarAction[];
}

/**
 * Initial shell content state.
 */
export const initialShellContentState: ShellContentState = {
  sidebarItems: [],
  toolbarActions: [],
};

/**
 * Shell content reducer with duplicate ID guards.
 */
const shellContentReducerFn = createReducer(
  initialShellContentState,

  on(ShellContentActions.addSidebarEntry, (state, sidebarItem) => {
    // Guard against duplicate sidebar item IDs
    const idExists = state.sidebarItems.some((item) => item.id === sidebarItem.id);
    if (idExists) {
      console.warn(`[ShellContent] Sidebar item with id '${sidebarItem.id}' already exists. Ignoring.`);
      return state;
    }
    return {
      ...state,
      sidebarItems: [...state.sidebarItems, sidebarItem],
    };
  }),

  on(ShellContentActions.addToolbarAction, (state, toolbarAction) => {
    // Guard against duplicate toolbar action IDs
    const idExists = state.toolbarActions.some((action) => action.id === toolbarAction.id);
    if (idExists) {
      console.warn(`[ShellContent] Toolbar action with id '${toolbarAction.id}' already exists. Ignoring.`);
      return state;
    }
    return {
      ...state,
      toolbarActions: [...state.toolbarActions, toolbarAction],
    };
  })
);

/**
 * Reducer function for the shell content slice.
 */
export function shellContentReducer(
  state: ShellContentState | undefined,
  action: Action
): ShellContentState {
  return shellContentReducerFn(state, action);
}
