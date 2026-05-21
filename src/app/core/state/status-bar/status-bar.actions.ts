import { createAction, props } from '@ngrx/store';
import { StatusBarItem } from '../../../shell/models/status-bar-item.model';

export const loadStatusBarItems = createAction(
  '[Status Bar] Load Items',
  props<{ items: StatusBarItem[] }>()
);

export const setCallbackError = createAction(
  '[Status Bar] Set Callback Error',
  props<{ itemId: string }>()
);

export const clearCallbackError = createAction(
  '[Status Bar] Clear Callback Error',
  props<{ itemId: string }>()
);
