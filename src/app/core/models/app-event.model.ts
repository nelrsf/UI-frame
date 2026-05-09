/**
 * Identifies a resizable dock region within the shell.
 * - `bottom-panel`: the horizontal panel below the primary content area.
 * - `secondary-panel`: the vertical auxiliary panel to the right of the content area.
 * - `primary-workspace`: the main content region (derived; not directly draggable).
 */
export type DockRegionId = 'bottom-panel' | 'secondary-panel' | 'primary-workspace';

/**
 * Catalog of versioned internal event names following the convention:
 * {boundedContext}.{entity}.{action}.v1
 */
export type AppEventName =
  | 'shell.ready.v1'
  | 'shell.layout.changed.v1'
  | 'shell.region.resized.v1'
  | 'sidebar.collapsed.v1'
  | 'sidebar.section.activated.v1'
  | 'sidebar.resized.v1'
  | 'bottomPanel.toggled.v1'
  | 'bottomPanel.resized.v1'
  | 'tabs.active.changed.v1'
  | 'tabs.reordered.v1'
  | 'command.executed.v1';

/** Minimal payload shapes for each event. Extend as needed. */
export interface AppEventPayloads {
  'shell.ready.v1': Record<string, never>;
  'shell.layout.changed.v1': { layout: string };
  /**
   * Emitted once per committed user-drag resize of a dock region boundary.
   * All pixel values are integers, clamped to the per-region min/max bounds.
   * Listener failures are isolated so one broken subscriber cannot block others.
   */
  'shell.region.resized.v1': {
    regionId: DockRegionId;
    widthPx: number | null;
    heightPx: number | null;
    source: 'user-drag';
    committedAt: number;
  };
  'sidebar.collapsed.v1': { collapsed: boolean };
  'sidebar.section.activated.v1': { sectionId: string };
  'sidebar.resized.v1': { width: number };
  'bottomPanel.toggled.v1': { visible: boolean };
  'bottomPanel.resized.v1': { height: number };
  'tabs.active.changed.v1': { tabId: string };
  'tabs.reordered.v1': { tabIds: string[] };
  'command.executed.v1': { commandId: string; success: boolean; timestamp: number; context?: string };
}

/**
 * Immutable event envelope emitted on the bus.
 * TName constrains the payload type automatically.
 */
export interface AppEvent<TName extends AppEventName = AppEventName> {
  readonly eventName: TName;
  readonly payload: AppEventPayloads[TName];
  readonly timestamp: number;
  readonly origin: string;
}
