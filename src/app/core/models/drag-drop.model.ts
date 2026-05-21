import { Type } from '@angular/core';
import { DockZone } from './dock-zone-assignment.model';

/**
 * Identifies which region contract a component implements.
 * Used by the DragDropService to validate drop targets.
 */
export enum RegionInterface {
  CentralRegionTab = 'central-region-tab',
  BottomPanelEntry = 'bottom-panel-entry',
  SecondaryPanelEntry = 'secondary-panel-entry',
}

/**
 * Tracks the current phase of a drag operation.
 */
export enum DragPhase {
  Idle = 'idle',
  Dragging = 'dragging',
  Dropping = 'dropping',
  Cancelled = 'cancelled',
}

/**
 * Represents a tab that is being dragged.
 * Created at drag start from the source tab's metadata.
 */
export interface DraggableTab {
  /** Unique tab identifier. */
  id: string;
  /** Display label shown in tab bar and drag ghost. */
  label: string;
  /** Icon identifier (optional). */
  icon?: string;
  /** Angular component type to render. */
  componentType: Type<unknown>;
  /** Region interfaces this component implements. */
  implementedInterfaces: Set<RegionInterface>;
  /** The zone the tab is being dragged from. */
  sourceZone: DockZone;
  /** The tab group ID in the source zone. */
  sourceGroupId: string;
  /** Whether the tab is pinned. */
  pinned: boolean;
  /** Whether the tab has unsaved changes. */
  dirty: boolean;
  /** Whether the tab can be closed. */
  closable: boolean;
}

/**
 * Tracks the current state of an active drag operation.
 * Only one drag operation can be active at a time.
 */
export interface DragState {
  /** Current phase of the drag operation. */
  phase: DragPhase;
  /** The tab being dragged (null when idle). */
  draggedTab: DraggableTab | null;
  /** Current pointer X coordinate. */
  pointerX: number;
  /** Current pointer Y coordinate. */
  pointerY: number;
  /** The zone currently under the pointer (null if none). */
  activeDropZone: DockZone | null;
  /** Whether the active drop zone accepts the dragged tab. */
  dropCompatible: boolean;
  /** The pointer ID for capture (null when idle). */
  pointerId: number | null;
}

/**
 * Represents a registered drop zone that can accept dragged tabs.
 */
export interface DropZoneRegistration {
  /** The dock zone this registration represents. */
  zone: DockZone;
  /** The DOM element that defines the drop zone area. */
  element: HTMLElement;
  /** The interface a tab must implement to be accepted. */
  requiredInterface: RegionInterface;
  /** Cached bounding rect (updated on pointermove). */
  boundingRect: DOMRect | null;
}
