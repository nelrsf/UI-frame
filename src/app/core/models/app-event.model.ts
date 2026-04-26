/**
 * Catalog of versioned internal event names following the convention:
 * {boundedContext}.{entity}.{action}.v1
 */
export type AppEventName =
  | 'shell.ready.v1'
  | 'shell.layout.changed.v1'
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
