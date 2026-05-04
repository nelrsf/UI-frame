import { createReducer, on } from '@ngrx/store';
import * as UiContextActions from './ui-context.actions';

/** A single entry in the breadcrumb navigation trail. */
export interface BreadcrumbItem {
  /** Unique identifier for this breadcrumb segment. */
  readonly id: string;
  /** Human-readable label displayed in the breadcrumb. */
  readonly label: string;
  /** Optional navigation URL associated with this segment. */
  readonly url?: string;
}

/** A single item rendered in the shell status bar. */
export interface StatusBarItem {
  /** Unique identifier used to replace or remove this item. */
  readonly id: string;
  /** Text label rendered in the status bar. */
  readonly label: string;
  /** Optional tooltip shown on hover. */
  readonly tooltip?: string;
  /** Alignment side within the status bar. */
  readonly alignment: 'left' | 'right';
}

export interface UiContextState {
  /** Current breadcrumb trail reflecting the active navigation context. */
  readonly breadcrumbs: BreadcrumbItem[];
  /** Items rendered in the shell status bar. */
  readonly statusItems: StatusBarItem[];
  /** Command IDs representing the context-sensitive toolbar actions currently available. */
  readonly availableActions: string[];
}

export const initialUiContextState: UiContextState = {
  breadcrumbs: [],
  statusItems: [],
  availableActions: [],
};

export const uiContextReducer = createReducer(
  initialUiContextState,
  on(UiContextActions.setBreadcrumbs, (state, { breadcrumbs }) => ({
    ...state,
    breadcrumbs,
  })),
  on(UiContextActions.setStatusItems, (state, { items }) => ({
    ...state,
    statusItems: items,
  })),
  on(UiContextActions.setAvailableActions, (state, { actions }) => ({
    ...state,
    availableActions: actions,
  }))
);
