/**
 * Contract: CSS Grid Layout for Internal Dockzones
 * 
 * This contract defines the CSS grid layout implementation for internal dockzones.
 */

/**
 * Layout direction enumeration
 */
export enum LayoutSplitDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

/**
 * Interface for CSS grid layout model
 */
export interface CSSGridLayoutModel {
  /** Layout direction */
  direction: LayoutSplitDirection;
  /** Grid template columns (for horizontal direction) */
  gridTemplateColumns?: string;
  /** Grid template rows (for vertical direction) */
  gridTemplateRows?: string;
  /** Zone sizes as fractions or pixel values */
  zoneSizes?: Array<{
    zoneId: string;
    size: string | number;
  }>;
}

/**
 * Interface for CSS grid container component
 */
export interface ICSSGridLayoutContainer {
  /** Current layout model */
  layoutModel: CSSGridLayoutModel;
  /** Whether the container is currently being resized */
  isResizing: boolean;
  /** Draft grid properties during resize */
  draftGridProperties?: {
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
  };
}

/**
 * CSS Grid property bindings for horizontal layout
 */
export const HORIZONTAL_GRID_PROPERTIES = {
  /** Default grid template for horizontal layout */
  DEFAULT_TEMPLATE: 'repeat(auto-fit, minmax(100px, 1fr))',
  /** Resize state grid template */
  RESIZE_TEMPLATE: 'var(--zone-1-width, 1fr) var(--zone-2-width, 1fr)',
  /** Minimum size constraint */
  MIN_SIZE: '100px'
} as const;

/**
 * CSS Grid property bindings for vertical layout
 */
export const VERTICAL_GRID_PROPERTIES = {
  /** Default grid template for vertical layout */
  DEFAULT_TEMPLATE: 'repeat(auto-fit, minmax(100px, 1fr))',
  /** Resize state grid template */
  RESIZE_TEMPLATE: 'var(--zone-1-height, 1fr) var(--zone-2-height, 1fr)',
  /** Minimum size constraint */
  MIN_SIZE: '100px'
} as const;

/**
 * CSS class names for grid layouts
 */
export const GRID_LAYOUT_CLASSES = {
  /** Base grid container class */
  CONTAINER: 'layout-splittable-grid-container',
  /** Horizontal layout class */
  HORIZONTAL: 'layout-splittable-grid-horizontal',
  /** Vertical layout class */
  VERTICAL: 'layout-splittable-grid-vertical',
  /** Resizing state class */
  RESIZING: 'layout-splittable-grid-resizing'
} as const;

/**
 * CSS custom properties for grid layouts
 */
export const GRID_CSS_VARS = {
  /** Zone 1 width property */
  ZONE_1_WIDTH: '--zone-1-width',
  /** Zone 2 width property */
  ZONE_2_WIDTH: '--zone-2-width',
  /** Zone 1 height property */
  ZONE_1_HEIGHT: '--zone-1-height',
  /** Zone 2 height property */
  ZONE_2_HEIGHT: '--zone-2-height'
} as const;