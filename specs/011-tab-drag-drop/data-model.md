# Data Model: Tab Drag-and-Drop

## Enums

### RegionInterface

Identifies which region contract a component implements.

| Value | Description | Corresponding Contract |
|---|---|---|
| `CentralRegionTab` | Component can be rendered in the central workspace | `ICentralRegionTab` |
| `BottomPanelEntry` | Component can be rendered in the bottom panel | `IBottomPanelEntry` |
| `SecondaryPanelEntry` | Component can be rendered in the secondary panel | `ISecondaryPanelEntry` |

### DragPhase

Tracks the current phase of a drag operation.

| Value | Description |
|---|---|
| `Idle` | No drag operation in progress |
| `Dragging` | User is actively dragging a tab |
| `Dropping` | User released over a valid drop zone; processing |
| `Cancelled` | User released outside valid zones or pressed Escape |

## Entities

### DraggableTab

Represents a tab that is being dragged. Created at drag start from the source tab's metadata.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique tab identifier |
| `label` | `string` | Display label shown in tab bar and drag ghost |
| `icon` | `string \| undefined` | Icon identifier (optional) |
| `componentType` | `Type<unknown>` | Angular component type to render |
| `implementedInterfaces` | `Set<RegionInterface>` | Region interfaces this component implements |
| `sourceZone` | `DockZone` | The zone the tab is being dragged from |
| `sourceGroupId` | `string` | The tab group ID in the source zone |
| `pinned` | `boolean` | Whether the tab is pinned |
| `dirty` | `boolean` | Whether the tab has unsaved changes |
| `closable` | `boolean` | Whether the tab can be closed |

### DragState

Tracks the current state of an active drag operation. Only one drag operation can be active at a time.

| Field | Type | Description |
|---|---|---|
| `phase` | `DragPhase` | Current phase of the drag operation |
| `draggedTab` | `DraggableTab \| null` | The tab being dragged (null when idle) |
| `pointerX` | `number` | Current pointer X coordinate |
| `pointerY` | `number` | Current pointer Y coordinate |
| `activeDropZone` | `DockZone \| null` | The zone currently under the pointer (null if none) |
| `dropCompatible` | `boolean` | Whether the active drop zone accepts the dragged tab |
| `pointerId` | `number \| null` | The pointer ID for capture (null when idle) |

### DropZoneRegistration

Represents a registered drop zone that can accept dragged tabs.

| Field | Type | Description |
|---|---|---|
| `zone` | `DockZone` | The dock zone this registration represents |
| `element` | `HTMLElement` | The DOM element that defines the drop zone area |
| `requiredInterface` | `RegionInterface` | The interface a tab must implement to be accepted |
| `boundingRect` | `DOMRect \| null` | Cached bounding rect (updated on pointermove) |

## State Transitions

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
┌──────┐  pointerdown   ┌──────────┐  pointerup       ┌──────────┐
│ Idle ├───────────────►│ Dragging ├─────────────────►│ Dropping │
└──────┘                └──────────┘                  └────┬─────┘
     ▲                       │                             │
     │                       │ pointerup outside           │ state update
     │                       │ zones / Escape / cancel     │ complete
     │                       ▼                             ▼
     │                 ┌───────────┐                 ┌──────┐
     └─────────────────┤ Cancelled │────────────────►│ Idle │
                       └───────────┘                 └──────┘
```

## NgRx State Changes

### New Actions

**Workspace Actions**:
- `moveTabToZone`: `{ tabId: string, sourceGroupId: string, sourceZone: DockZone, targetZone: DockZone, tabMetadata: TabItem }`
- `removeTab`: `{ tabId: string, groupId: string }`

**ShellContent Actions**:
- `removeBottomPanelEntry`: `{ entryId: string }`
- `removeSecondaryPanelEntry`: `{ entryId: string }`

### Reducer Behavior

**`moveTabToZone` handler**:
1. Removes the tab from the source group's `tabs` and `registeredTabs` arrays
2. If the target zone is `PrimaryWorkspace`, adds the tab to the target group (creates group if needed)
3. If the target zone is `BottomPanel` or `SecondaryPanel`, the tab is removed from workspace state; the corresponding `ShellManager.addBottomPanelEntry` or `addSecondaryPanelEntry` call handles the target registration

**`removeTab` handler**:
1. Removes the tab from both `tabs` and `registeredTabs` arrays in the specified group
2. If the removed tab was active, resolves the next active tab (prefer left adjacent, then right adjacent, then null)

**`removeBottomPanelEntry` handler**:
1. Removes the entry from `bottomPanelTabs` array
2. If the removed entry was active, sets `activeSecondaryPanelEntryId` to null or the first remaining entry

**`removeSecondaryPanelEntry` handler**:
1. Removes the entry from `secondaryPanelEntries` array
2. If the removed entry was active, sets `activeSecondaryPanelEntryId` to null or the first remaining entry
