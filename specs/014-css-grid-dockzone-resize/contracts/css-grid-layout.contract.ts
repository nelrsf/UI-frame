/**
 * Contract: Internal Zone Resize via Flex Layout
 * 
 * This contract defines the flex-based resize implementation for internal dockzones.
 */

/**
 * Layout direction enumeration
 */
export enum LayoutSplitDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

/**
 * Drag direction enumeration for internal zones
 */
export type DragDirection = 'horizontal' | 'vertical';

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
 * CSS class names for flex layouts
 */
export const FLEX_LAYOUT_CLASSES = {
  /** Base flex container class */
  CONTAINER: 'splitter-container',
  /** Layout panel class */
  PANEL: 'layout-splittable-panel',
  /** Row wrapper class */
  ROW_WRAPPER: 'layout-splittable-row-wrapper',
  /** Row class */
  ROW: 'layout-splittable-row',
  /** Panel region class */
  PANEL_REGION: 'splittable-panel-region',
  /** Hidden class */
  HIDDEN: 'hidden'
} as const;

/**
 * Flex style properties for draft dimensions
 */
export const FLEX_STYLE_PROPS = {
  /** Width style property */
  WIDTH: 'style.width',
  /** Flex style property */
  FLEX: 'style.flex'
} as const;