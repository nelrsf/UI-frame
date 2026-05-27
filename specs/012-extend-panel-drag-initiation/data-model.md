# Data Model: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Feature**: 012-extend-panel-drag-initiation

## Entities

### DraggableTab

Represents a tab that can be dragged across regions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier for the tab |
| `label` | `string` | Display label for the tab |
| `icon` | `string \| undefined` | Optional icon identifier |
| `component` | `Type<unknown>` | Angular component type reference (matches `ShellTab.component`) |
| `implementedInterfaces` | `Set<RegionInterface>` | Set of region interfaces the component implements |
| `sourceZone` | `DockZone` | Origin zone (PrimaryWorkspace, BottomPanel, SecondaryPanel) |
| `sourceGroupId` | `string` | Workspace tab group ID (empty string for panel tabs) |
| `pinned` | `boolean` | Whether the tab is pinned (always false for panel tabs) |
| `dirty` | `boolean` | Whether the tab has unsaved changes (always false for panel tabs) |
| `closable` | `boolean` | Whether the tab can be closed |

### RegionInterface

Enum representing the interfaces a component can implement.

| Value | Description |
|-------|-------------|
| `CentralRegionTab` | Component can be displayed in the central workspace |
| `BottomPanelEntry` | Component can be displayed in the bottom panel |
| `SecondaryPanelEntry` | Component can be displayed in the secondary panel |

### DockZone

Enum representing the drop zones in the shell.

| Value | Description |
|-------|-------------|
| `PrimaryWorkspace` | Central region tab bar |
| `BottomPanel` | Bottom panel tab bar |
| `SecondaryPanel` | Secondary panel tab bar |

### CrossRegionDropPayload

Emitted when a tab is successfully dropped into a different region.

| Field | Type | Description |
|-------|------|-------------|
| `tab` | `DraggableTab` | The tab being dropped |
| `targetZone` | `DockZone` | The destination zone |
| `targetIndex` | `number` | Insertion position in the target zone |

## NgRx Actions (New)

### Reorder Bottom Panel Tabs

**Action**: `[ShellContent] Reorder Bottom Panel Tabs`

| Field | Type | Description |
|-------|------|-------------|
| `fromIndex` | `number` | Original position of the tab |
| `toIndex` | `number` | New position of the tab |

### Reorder Secondary Panel Entries

**Action**: `[ShellContent] Reorder Secondary Panel Entries`

| Field | Type | Description |
|-------|------|-------------|
| `fromIndex` | `number` | Original position of the entry |
| `toIndex` | `number` | New position of the entry |

## State Transitions

### Drag Lifecycle

1. **Idle** → `pointerdown` → **Potential Drag** (tracking pointer movement)
2. **Potential Drag** → pointer moves > 4px → **Active Drag** (ghost visible, drop zones highlighted)
3. **Active Drag** → `pointerup` on compatible zone → **Drop Executed** (state updated via NgRx)
4. **Active Drag** → `pointerup` outside zones or Escape → **Cancelled** (state unchanged)

### Same-Zone Drop Rejection

When `activeDropZone === draggedTab.sourceZone`, the service sets `activeDropZone = null` and `dropCompatible = false`. This prevents cross-region drop logic and allows same-region reorder to take over via `registerReorderSource()` callback.

## Validation Rules

- `sourceZone` must be a valid `DockZone` enum value
- `implementedInterfaces` must not be empty (component must implement at least one region interface)
- `fromIndex` and `toIndex` for reorder actions must be within bounds of the panel's tab array
- `componentType` must be a valid Angular component type (injectable)
