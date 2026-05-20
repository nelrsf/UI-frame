import { createReducer, on, Action } from '@ngrx/store';
import { SidebarItem } from '../../../shell/models/sidebar-item.model';
import { ToolbarAction } from '../../../shell/models/toolbar-action.model';
import { PanelTab } from '../../../shell/models/panel-tab.model';
import { SecondaryPanelEntry } from '../../../shell/models/secondary-panel-entry.model';
import * as ShellContentActions from './shell-content.actions';

/**
 * Shell content state shape (sidebar, toolbar, bottom panel, secondary panel only).
 * Tab management has been moved to the workspace slice.
 */
export interface ShellContentState {
  sidebarItems: SidebarItem[];
  toolbarActions: ToolbarAction[];
  bottomPanelTabs: PanelTab[];
  secondaryPanelEntries: SecondaryPanelEntry[];
  activeSecondaryPanelEntryId: string | null;
}

/**
 * Initial shell content state.
 */
export const initialShellContentState: ShellContentState = {
  sidebarItems: [],
  toolbarActions: [],
  bottomPanelTabs: [],
  secondaryPanelEntries: [],
  activeSecondaryPanelEntryId: null,
};

function pickSecondaryDefault(entries: SecondaryPanelEntry[]): string | null {
  if (entries.length === 0) {
    return null;
  }

  const weather = entries.find((entry) => entry.id === 'secondary-weather');
  return weather?.id ?? entries[0].id;
}

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
  }),

  on(ShellContentActions.addSecondaryPanelEntry, (state, { entry }) => {
    const idExists = state.secondaryPanelEntries.some((existing) => existing.id === entry.id);
    if (idExists) {
      console.warn(`[ShellContent] Secondary panel entry with id '${entry.id}' already exists. Ignoring.`);
      return state;
    }

    const secondaryPanelEntries = [...state.secondaryPanelEntries, entry];
    const hasCurrentActive =
      !!state.activeSecondaryPanelEntryId &&
      secondaryPanelEntries.some((existing) => existing.id === state.activeSecondaryPanelEntryId);

    const activeSecondaryPanelEntryId =
      entry.id === 'secondary-weather'
        ? 'secondary-weather'
        : hasCurrentActive
          ? state.activeSecondaryPanelEntryId
          : pickSecondaryDefault(secondaryPanelEntries);

    return {
      ...state,
      secondaryPanelEntries,
      activeSecondaryPanelEntryId,
    };
  }),

  on(ShellContentActions.setActiveSecondaryPanelEntry, (state, { id }) => {
    const exists = state.secondaryPanelEntries.some((entry) => entry.id === id);
    if (exists) {
      return { ...state, activeSecondaryPanelEntryId: id };
    }

    console.warn(`[ShellContent] Secondary panel entry with id '${id}' not found. Applying fallback.`);
    return {
      ...state,
      activeSecondaryPanelEntryId: pickSecondaryDefault(state.secondaryPanelEntries),
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
