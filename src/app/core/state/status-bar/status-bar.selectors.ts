import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StatusBarState } from './status-bar.reducer';

export const selectStatusBarState = createFeatureSelector<StatusBarState>('statusBar');

export const selectStatusBarLeftItems = createSelector(
  selectStatusBarState,
  (state) => state?.leftItems ?? []
);

export const selectStatusBarRightItems = createSelector(
  selectStatusBarState,
  (state) => state?.rightItems ?? []
);

export const selectStatusBarLoaded = createSelector(
  selectStatusBarState,
  (state) => state?.loaded ?? false
);

export const selectStatusBarError = createSelector(
  selectStatusBarState,
  (state) => state?.error ?? null
);

export const selectStatusBarErrorItems = createSelector(
  selectStatusBarState,
  (state) => {
    if (!state) return [];
    return [
      ...state.leftItems.filter((item) => item.color === 'error'),
      ...state.rightItems.filter((item) => item.color === 'error'),
    ];
  }
);
