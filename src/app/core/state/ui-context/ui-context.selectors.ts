import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiContextState } from './ui-context.reducer';

export const selectUiContextState = createFeatureSelector<UiContextState>('uiContext');

export const selectBreadcrumbs = createSelector(
  selectUiContextState,
  (state) => state.breadcrumbs
);

export const selectStatusItems = createSelector(
  selectUiContextState,
  (state) => state.statusItems
);

export const selectAvailableActions = createSelector(
  selectUiContextState,
  (state) => state.availableActions
);
