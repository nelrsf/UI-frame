import { createReducer, on, Action } from '@ngrx/store';
import { Type } from '@angular/core';
import { TabItem } from '../../../shell/models/tab-item.model';
import { SidebarItem } from '../../../shell/models/sidebar-item.model';
import { ToolbarAction } from '../../../shell/models/toolbar-action.model';
import { PanelTab } from '../../../shell/models/panel-tab.model';
import * as ShellContentActions from './shell-content.actions';

/**
 * Internal wrapper for a tab with its component type.
 */
export interface ShellTab {
  tabItem: TabItem;
  componentType: Type<unknown>;
}

/**
 * Shell content state shape.
 */
export interface ShellContentState {
  tabs: ShellTab[];
  activeShellTabId: string | null;
  sidebarItems: SidebarItem[];
  toolbarActions: ToolbarAction[];
  bottomPanelTabs: PanelTab[];
}

/**
 * Initial shell content state.
 */
export const initialShellContentState: ShellContentState = {
  tabs: [],
  activeShellTabId: null,
  sidebarItems: [],
  toolbarActions: [],
  bottomPanelTabs: [],
};

/**
 * Shell content reducer with duplicate ID guards.
 */
const shellContentReducerFn = createReducer(
  initialShellContentState,

  on(ShellContentActions.addShellTab, (state, { tabItem, componentType }) => {
    // Guard against duplicate tab IDs
    const idExists = state.tabs.some((tab) => tab.tabItem.id === tabItem.id);
    if (idExists) {
      console.warn(`[ShellContent] Tab with id '${tabItem.id}' already exists. Ignoring.`);
      return state;
    }
    // Set as active if this is the first tab
    const newActiveTabId = state.activeShellTabId || tabItem.id;
    return {
      ...state,
      tabs: [...state.tabs, { tabItem, componentType }],
      activeShellTabId: newActiveTabId,
    };
  }),

  on(ShellContentActions.setActiveShellTab, (state, { id }) => {
    // Verify tab exists
    const tabExists = state.tabs.some((tab) => tab.tabItem.id === id);
    if (!tabExists) {
      console.warn(`[ShellContent] Tab with id '${id}' not found. Ignoring.`);
      return state;
    }
    return { ...state, activeShellTabId: id };
  }),

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
  }),

  on(ShellContentActions.addBottomPanelEntry, (state, panelTab) => {
    // Guard against duplicate panel tab IDs
    const idExists = state.bottomPanelTabs.some((tab) => tab.id === panelTab.id);
    if (idExists) {
      console.warn(`[ShellContent] Bottom panel tab with id '${panelTab.id}' already exists. Ignoring.`);
      return state;
    }
    return {
      ...state,
      bottomPanelTabs: [...state.bottomPanelTabs, panelTab],
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
