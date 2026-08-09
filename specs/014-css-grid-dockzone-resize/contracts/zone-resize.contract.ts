/**
 * Contract: Zone Resize Operations via DragOperation
 * 
 * This contract defines the interface for zone resize operations within the layout system
 * using the unified DragOperation class.
 */

import { Observable, Subject, BehaviorSubject } from 'rxjs';

/**
 * Drag direction enumeration for internal zones
 */
export type DragDirection = 'horizontal' | 'vertical';

/**
 * Type for simple drag draft (bottom & secondary panels)
 */
export type SimpleDragDraft = number | null;

/**
 * Type for simple drag end (bottom & secondary panels)
 */
export type SimpleDragEnd = number;

/**
 * Interface for internal zone drag draft state
 */
export interface InternalZoneDragDraft {
  /** Zone identifier being resized */
  zone: string;
  /** Direction of resize: 'horizontal' or 'vertical' */
  direction: DragDirection;
  /** Current dimension value during drag */
  draftDimension: number;
}

/**
 * Interface for internal zone drag end state
 */
export interface InternalZoneDragEnd {
  /** Zone identifier being resized */
  zone: string;
  /** Direction of resize: 'horizontal' or 'vertical' */
  direction: DragDirection;
  /** Final committed dimension value */
  committedDimension: number;
}

/**
 * Interface for zone resize drag service
 */
export interface IShellSplitterDragService {
  /** Draft height during bottom splitter drag (null = use committed NgRx value) */
  readonly draftBottomHeight$: Observable<number | null>;
  
  /** Draft width during secondary splitter drag (null = use committed NgRx value) */
  readonly draftSecondaryWidth$: Observable<number | null>;
  
  /** Draft dimension during internal zone drag */
  readonly draftInternalZoneDimension$: Observable<InternalZoneDragDraft | null>;
  
  /** Observable of drag end events for bottom splitter */
  readonly onBottomDragEnd$: Observable<number>;
  
  /** Observable of drag end events for secondary splitter */
  readonly onSecondaryDragEnd$: Observable<number>;
  
  /** Observable of drag end events for internal zone drag */
  readonly onInternalZoneDragEnd$: Observable<InternalZoneDragEnd>;
  
  // ── Bottom splitter pointer events ────────────────────────────────────────
  onBottomSplitterPointerDown(event: PointerEvent, committedHeight: number): void;
  onBottomSplitterPointerMove(event: PointerEvent): void;
  onBottomSplitterPointerUp(event: PointerEvent): void;
  onBottomSplitterPointerCancel(event: PointerEvent): void;
  
  // ── Secondary splitter pointer events ─────────────────────────────────────
  onSecondarySplitterPointerDown(event: PointerEvent, committedWidth: number): void;
  onSecondarySplitterPointerMove(event: PointerEvent): void;
  onSecondarySplitterPointerUp(event: PointerEvent): void;
  onSecondarySplitterPointerCancel(event: PointerEvent): void;
  
  // ── Internal zone splitter pointer events ─────────────────────────────────
  onInternalZonePointerDown(event: PointerEvent, zone: string, direction: DragDirection, initialDimension: number): void;
  onInternalZonePointerMove(event: PointerEvent): void;
  onInternalZonePointerUp(event: PointerEvent): void;
  onInternalZonePointerCancel(event: PointerEvent): void;
}

/**
 * NgRx Actions for zone resize
 */
export enum ZoneResizeAction {
  START_ZONE_RESIZE = '[Layout] Start Zone Resize',
  DRAFT_ZONE_DIMENSION = '[Layout] Draft Zone Dimension',
  COMMIT_ZONE_DIMENSION = '[Layout] Commit Zone Dimension',
  CANCEL_ZONE_RESIZE = '[Layout] Cancel Zone Resize'
}

/**
 * NgRx Action: Start Zone Resize
 */
export interface StartZoneResizeAction {
  type: ZoneResizeAction.START_ZONE_RESIZE;
  payload: {
    zone: string;
    direction: DragDirection;
    initialDimension: number;
  };
}

/**
 * NgRx Action: Draft Zone Dimension
 */
export interface DraftZoneDimensionAction {
  type: ZoneResizeAction.DRAFT_ZONE_DIMENSION;
  payload: {
    zone: string;
    draftDimension: number;
  };
}

/**
 * NgRx Action: Commit Zone Dimension
 */
export interface CommitZoneDimensionAction {
  type: ZoneResizeAction.COMMIT_ZONE_DIMENSION;
  payload: {
    zone: string;
    committedDimension: number;
  };
}

/**
 * NgRx Action: Cancel Zone Resize
 */
export interface CancelZoneResizeAction {
  type: ZoneResizeAction.CANCEL_ZONE_RESIZE;
}