# Data Model: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Updated**: 2026-06-14
**Feature**: 012-extend-panel-drag-initiation

## Entities

### ShellTab

Represents a tab rendered by a dock-zone panel.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Stable identifier for the tab instance |
| `label` | `string` | Display label for the tab |
| `icon` | `string \| undefined` | Optional display icon |
| `component` | `Type<unknown>` | Runtime Angular component reference used for rendering |
| `closeable` | `ICloseable \| undefined` | Optional close/dirty metadata |
| `pinnable` | `IPinnable \| undefined` | Optional pin metadata |
| `draggable` | `IDraggable \| undefined` | Optional drag-and-drop metadata |

### Draggable Metadata

Represents the runtime drag contract attached to a shell tab.

| Field | Type | Description |
|-------|------|-------------|
| `sourceZone` | `DockZone` | Dock zone the tab is currently dragged from |
| `targetZone` | `DockZone \| null` | Current target zone while dragging, when known |
| `allowableDropTargets` | `DockZone[]` | Zones that may accept this tab |
| `reorderTargetIndex` | `number \| null` | Target insertion index for same-zone reorder or cross-zone insertion |

### DockZone

Enum representing fixed shell dock zones. The current implementation supports split primary workspace and bottom panel zones.

| Group | Values |
|-------|--------|
| Primary workspace zones | `PrimaryTopLeftWorkspace`, `PrimaryTopRightWorkspace`, `PrimaryBottomLeftWorkspace`, `PrimaryBottomRightWorkspace` |
| Bottom panel zones | `BottomLeftPanel`, `BottomCenterPanel`, `BottomRightPanel` |
| Secondary panel | `SecondaryPanel` |

### WorkspaceState

NgRx state for runtime tab membership and active selection.

| Field | Type | Description |
|-------|------|-------------|
| `registeredTabs` | `readonly ShellTab[]` | Runtime tab registry used to open restorable or contributed tabs |
| `tabsByZone` | `Map<DockZone, readonly ShellTab[]>` | Ordered open tabs per dock zone |
| `activeTabIdsByZone` | `Map<DockZone, string \| null>` | Active tab ID per dock zone |

### WorkspaceSession

Persisted workspace snapshot used to restore layout and restorable tabs.

| Field | Type | Description |
|-------|------|-------------|
| `workspaceId` | `string` | Workspace scope |
| `schemaVersion` | `number` | Snapshot schema version |
| `savedAt` | `string` | Save timestamp |
| `zoneAssignments` | `DockZoneAssignment[]` | Persisted zone visibility/group metadata |
| `activeTabPerZone` | `Partial<Record<DockZone, string>>` | Active tab per persisted zone |
| `tabs` | `TabDescriptor[]` | Ordered restorable tab descriptors |
| `dimensions` | `WorkspaceSessionDimensions` | Persisted shell dimensions |

### TabDescriptor

Serializable tab metadata. This must not include Angular component references.

| Field | Type | Description |
|-------|------|-------------|
| `tabId` | `string` | Stable tab ID |
| `viewId` | `string` | Restorable view type ID |
| `resourceKey` | `string \| undefined` | Optional resource identity |
| `zone` | `DockZone` | Persisted dock-zone membership |
| `pinned` | `boolean` | Persisted pin state |
| `closable` | `boolean` | Persisted closeability |

## NgRx Actions

### Move Tab To Zone

**Action**: `[Workspace] Move Tab To Zone`

| Field | Type | Description |
|-------|------|-------------|
| `tabId` | `string` | ID of the tab being moved |
| `sourceZone` | `DockZone` | Origin zone |
| `targetZone` | `DockZone` | Destination zone |
| `tabMetadata` | `ShellTab & WithDraggable` | Runtime metadata for the moved tab |

### Reorder Tab

**Action**: `[Workspace] Reorder Tab`

| Field | Type | Description |
|-------|------|-------------|
| `zone` | `DockZone` | Zone whose tab order changes |
| `toIndex` | `number \| null` | Target insertion index |
| `reorderedTab` | `ShellTab & WithDraggable` | Runtime tab being reordered |

### Restore Workspace Tabs

**Action**: Pending implementation.

| Field | Type | Description |
|-------|------|-------------|
| `tabsByZone` or descriptors | TBD | Restorable tab membership and order derived from `WorkspaceSession.tabs` |
| `activeTabIdsByZone` | TBD | Active tab per zone derived from `WorkspaceSession.activeTabPerZone` |

## State Transitions

### Drag Lifecycle

1. **Idle** -> `pointerdown` -> **Potential Drag** (pointer movement tracked)
2. **Potential Drag** -> pointer moves beyond threshold -> **Active Drag** (ghost visible, zones highlighted)
3. **Active Drag** -> `pointerup` on compatible different zone -> **Move Executed** (`moveTabToZone`)
4. **Active Drag** -> `pointerup` on compatible same zone with changed index -> **Reorder Executed** (`reorderTab`)
5. **Active Drag** -> `pointerup` outside zones or Escape -> **Cancelled** (state unchanged)

### Persistence Lifecycle

1. **Runtime State Updated** -> successful `moveTabToZone` or `reorderTab`
2. **Snapshot Built** -> restorable tabs are converted to ordered `TabDescriptor` entries with zone membership
3. **Session Saved** -> `WorkspaceSessionService.save()` writes a versioned workspace-scoped snapshot
4. **Session Restored** -> `WorkspaceSessionService.restore()` validates a snapshot and shell startup dispatches layout and workspace restoration
5. **Fallback** -> corrupt, schema-incompatible, or non-restorable entries are ignored without blocking safe shell startup

## Validation Rules

- `sourceZone`, `targetZone`, and persisted descriptor `zone` values must be valid current `DockZone` enum values.
- `allowableDropTargets` must include the hovered drop zone for a move to succeed.
- `reorderTargetIndex` must be null/undefined or within the target zone insertion bounds.
- Successful cross-zone moves must remove the tab from the source zone and add it once to the target zone.
- Successful same-zone reorders must preserve tab identity and only change order.
- Persisted sessions must store only serializable descriptors, never runtime component references.
- Restore must not duplicate tabs already present in a target zone.
