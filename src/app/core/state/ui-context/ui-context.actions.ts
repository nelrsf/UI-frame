import { createAction, props } from '@ngrx/store';
import { BreadcrumbItem, StatusBarItem } from './ui-context.reducer';

/**
 * Replaces the current breadcrumb trail with the supplied items.
 * An empty array clears the breadcrumbs.
 */
export const setBreadcrumbs = createAction(
  '[UiContext] Set Breadcrumbs',
  props<{ breadcrumbs: BreadcrumbItem[] }>()
);

/**
 * Replaces the status-bar items rendered by the StatusBar component.
 * An empty array clears all status items.
 */
export const setStatusItems = createAction(
  '[UiContext] Set Status Items',
  props<{ items: StatusBarItem[] }>()
);

/**
 * Replaces the set of command IDs representing available context toolbar actions.
 * An empty array clears all available actions.
 */
export const setAvailableActions = createAction(
  '[UiContext] Set Available Actions',
  props<{ actions: string[] }>()
);
