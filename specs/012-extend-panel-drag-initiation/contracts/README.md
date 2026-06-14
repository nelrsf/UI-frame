# Contracts: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Updated**: 2026-06-14
**Feature**: 012-extend-panel-drag-initiation

## Internal Contracts

This feature does not expose external APIs. All contracts are internal to the Angular shell.

### DockZonePanelComponent Contract

```typescript
class DockZonePanelComponent {
  zone: DockZone;
  tabs: readonly ShellTab[];
  activeTabId: string;

  onTabPointerDown(event: PointerEvent, tab: ShellTab): void;
}
```

Rules:

- Ignore non-primary mouse buttons.
- Delegate valid pointerdown events to `DragDropService.startDrag(tab, event)`.
- Render tab elements with `(pointerdown)="onTabPointerDown($event, tab)"`.

### DragDropService Contract

```typescript
interface DragDropService {
  activeDragState$: Observable<DragState | null>;
  activeDropZone$: Observable<DockZone | null>;
  dropCompatible$: Observable<boolean>;
  crossRegionDrop$: Observable<ShellTab & WithDraggable>;

  registerDropZone(zone: DockZone, element: HTMLElement): void;
  unregisterDropZone(zone: DockZone): void;
  startDrag(tab: ShellTab & WithDraggable, event: PointerEvent): void;
  onDragMove(event: PointerEvent): void;
  endDrag(): void;
  cancelDrag(): void;
  isDragging(): boolean;
}
```

Rules:

- Drag starts as a potential drag and becomes active only after threshold movement.
- Drop compatibility is derived from `tab.draggable.allowableDropTargets`.
- Compatible cross-zone drops dispatch `moveTabToZone`.
- Compatible same-zone drops with a changed insertion index dispatch `reorderTab`.
- Cancelled or incompatible drops dispatch no workspace mutation.

### NgRx Workspace Actions

```typescript
export const moveTabToZone = createAction(
  '[Workspace] Move Tab To Zone',
  props<{
    tabId: string;
    sourceZone: DockZone;
    targetZone: DockZone;
    tabMetadata: ShellTab & WithDraggable;
  }>()
);

export const reorderTab = createAction(
  '[Workspace] Reorder Tab',
  props<{
    zone: DockZone;
    toIndex: number | null;
    reorderedTab: ShellTab & WithDraggable;
  }>()
);
```

### NgRx Workspace State

```typescript
interface WorkspaceState {
  readonly registeredTabs: readonly ShellTab[];
  readonly tabsByZone: Map<DockZone, readonly ShellTab[]>;
  readonly activeTabIdsByZone: Map<DockZone, string | null>;
}
```

Rules:

- `tabsByZone` is the runtime source of truth for tab membership and order.
- `activeTabIdsByZone` is the runtime source of truth for active tab selection.
- Move and reorder reducers must create updated maps rather than mutating the existing map instance.

### Workspace Session Persistence Contract

```typescript
interface WorkspaceSession {
  workspaceId: string;
  schemaVersion: number;
  savedAt: string;
  zoneAssignments: DockZoneAssignment[];
  activeTabPerZone: Partial<Record<DockZone, string>>;
  tabs: TabDescriptor[];
  dimensions: WorkspaceSessionDimensions;
}

interface TabDescriptor {
  tabId: string;
  viewId: string;
  resourceKey?: string;
  zone: DockZone;
  pinned: boolean;
  closable: boolean;
}
```

Rules:

- Persist only serializable tab descriptors.
- Preserve descriptor order per zone after successful moves and reorders.
- Preserve active tab per zone when the active tab is restorable.
- Reject corrupt or schema-incompatible snapshots and fall back to safe defaults.
- Do not persist runtime Angular component references.
