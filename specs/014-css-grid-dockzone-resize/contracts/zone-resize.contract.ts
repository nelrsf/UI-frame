/**
 * Contract: Zone Resize Operations
 * 
 * This contract defines the interface for zone resize operations within the layout system.
 */

import { Observable } from 'rxjs';

/**
 * Interface for resize interaction events
 */
export interface ResizeInteraction {
  /** Zone identifier being resized */
  zoneId: string;
  /** Direction of resize: 'horizontal' or 'vertical' */
  direction: 'horizontal' | 'vertical';
  /** Current dimension value during drag */
  draftDimension: number;
  /** Final committed dimension value */
  committedDimension?: number;
}

/**
 * Interface for zone dimension state
 */
export interface ZoneDimensionState {
  /** Zone identifier */
  zoneId: string;
  /** Current width in pixels */
  width: number;
  /** Current height in pixels */
  height: number;
  /** Minimum width constraint (100px) */
  minWidth: number;
  /** Minimum height constraint (100px) */
  minHeight: number;
  /** Maximum width constraint */
  maxWidth?: number;
  /** Maximum height constraint */
  maxHeight?: number;
}

/**
 * Interface for zone resize service
 */
export interface IZoneResizeService {
  /** Observable of draft dimensions during drag */
  readonly draftDimensions$: Observable<ZoneDimensionState | null>;
  
  /** Observable of committed dimensions after drag ends */
  readonly onDimensionCommit$: Observable<ZoneDimensionState>;
  
  /** Start drag operation for a zone */
  startDrag(zoneId: string, direction: 'horizontal' | 'vertical', initialDimension: number): void;
  
  /** Handle pointer move event during drag */
  onPointerMove(event: PointerEvent): void;
  
  /** Handle pointer up event (end drag) */
  onPointerUp(event: PointerEvent): void;
  
  /** Handle pointer cancel event */
  onPointerCancel(event: PointerEvent): void;
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
    zoneId: string;
    direction: 'horizontal' | 'vertical';
    initialDimension: number;
  };
}

/**
 * NgRx Action: Draft Zone Dimension
 */
export interface DraftZoneDimensionAction {
  type: ZoneResizeAction.DRAFT_ZONE_DIMENSION;
  payload: {
    zoneId: string;
    draftDimension: number;
  };
}

/**
 * NgRx Action: Commit Zone Dimension
 */
export interface CommitZoneDimensionAction {
  type: ZoneResizeAction.COMMIT_ZONE_DIMENSION;
  payload: {
    zoneId: string;
    committedDimension: number;
  };
}

/**
 * NgRx Action: Cancel Zone Resize
 */
export interface CancelZoneResizeAction {
  type: ZoneResizeAction.CANCEL_ZONE_RESIZE;
}