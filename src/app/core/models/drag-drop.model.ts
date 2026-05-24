import { DockZone } from './dock-zone-assignment.model';
import { ShellTab } from '../../shell/contracts/ShellTab';
import { WithDraggable } from '../../shell/models/tab-item.model';

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
 * Tracks the current state of an active drag operation.
 * Only one drag operation can be active at a time.
 */
export interface DragState {
  /** Current phase of the drag operation. */
  phase: DragPhase;
  /** The tab being dragged (null when idle). */
  draggedTab: (ShellTab & WithDraggable) | null;
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
  /** Cached bounding rect (updated on pointermove). */
  boundingRect: DOMRect | null;
}
