import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShellContentState } from './shell-content.reducer';

/**
 * Select the root shell content state.
 */
export const selectShellContentState = createFeatureSelector<ShellContentState>('shellContent');

/**
 * Select all sidebar items.
 */
export const selectShellSidebarItems = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.sidebarItems
);

/**
 * Select all toolbar actions.
 */
export const selectShellToolbarActions = createSelector(
  selectShellContentState,
  (state: ShellContentState) => state.toolbarActions
);
