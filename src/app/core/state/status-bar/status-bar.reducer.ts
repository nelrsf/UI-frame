import { createReducer, on } from '@ngrx/store';
import { StatusBarItem } from '../../../shell/models/status-bar-item.model';
import * as StatusBarActions from './status-bar.actions';

export interface StatusBarState {
  readonly leftItems: StatusBarItem[];
  readonly rightItems: StatusBarItem[];
  readonly loaded: boolean;
  readonly error: string | null;
}

export const initialStatusBarState: StatusBarState = {
  leftItems: [],
  rightItems: [],
  loaded: false,
  error: null,
};

export const statusBarReducer = createReducer(
  initialStatusBarState,
  on(StatusBarActions.loadStatusBarItems, (state, { items }) => {
    const leftItems = items.filter((item) => (item as any).position === 'left');
    const rightItems = items.filter((item) => (item as any).position !== 'left');
    return {
      ...state,
      leftItems,
      rightItems,
      loaded: true,
      error: null,
    };
  }),
  on(StatusBarActions.setCallbackError, (state, { itemId }) => {
    const errorItems = [...state.leftItems, ...state.rightItems];
    const item = errorItems.find((i) => i.id === itemId);
    if (!item) return state;

    const updateColor = (items: StatusBarItem[]): StatusBarItem[] =>
      items.map((i) => (i.id === itemId ? { ...i, color: 'error' } : i));

    return {
      ...state,
      leftItems: updateColor(state.leftItems),
      rightItems: updateColor(state.rightItems),
    };
  }),
  on(StatusBarActions.clearCallbackError, (state, { itemId }) => {
    const updateColor = (items: StatusBarItem[]): StatusBarItem[] =>
      items.map((i) => (i.id === itemId ? { ...i, color: 'default' } : i));

    return {
      ...state,
      leftItems: updateColor(state.leftItems),
      rightItems: updateColor(state.rightItems),
    };
  })
);
