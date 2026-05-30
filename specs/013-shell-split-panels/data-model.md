# Data Model: Shell Split Panels

**Date**: 2026-05-30  
**Feature**: 013-shell-split-panels

## Entities

### LayoutSplitDirection

Represents the split orientation for a splittable region.

| Value | Description |
|-------|-------------|
| `horizontal` | Bottom-panel split orientation (stacked top/bottom). |
| `vertical` | Primary workspace split orientation (side-by-side). |

### LayoutSplitSubRegion

Represents one pane inside a split layout.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Stable identifier for the pane. |
| `tabsIds` | `string[]` | Ordered list of tab IDs assigned to this pane. |
| `activeTabId` | `string | null` | Currently active tab ID. |
| `visible` | `boolean` | Whether this pane is visible. Defaults to `true`. |
| `size` | `number | undefined` | Optional committed pane size in pixels for the split axis. |

### LayoutSplittableRegionModel

Represents the persisted split layout for a region.

| Field | Type | Description |
|-------|------|-------------|
| `direction` | `LayoutSplitDirection` | Orientation of the split. |
| `regions` | `LayoutSplitSubRegion[]` | The list of panes in the split layout. |
| `maxSubRegions` | `number` | Maximum allowed number of panes. |

## NgRx State Shape

Extend the existing `LayoutState` with a new optional field:

```ts
export interface LayoutState {
  // existing state...
  readonly splitPanelLayout: LayoutSplittableRegionModel | null;
}
```

## Actions

### Set Split Layout

**Action**: `[Layout] Set Split Layout`

**Payload**:

```ts
props<{ splitLayout: LayoutSplittableRegionModel | null }>()
```

### Set Split Pane Size

**Action**: `[Layout] Set Split Pane Size`

**Payload**:

```ts
props<{ paneId: string; size: number }>()
```

## State Transitions

### Split Creation

- Initial state: one `LayoutSplitSubRegion` with all tabs assigned.  
- On split, append a new subregion to `regions` with an empty `tabsIds` array and update `direction` if needed.  
- The split button disables when `regions.length >= maxSubRegions`.

### Split Persistence

- Updates to `splitPanelLayout` are emitted as NgRx actions.  
- On shell restore, the persisted `splitPanelLayout` is rehydrated into component inputs.

## Validation Rules

- `direction` must be `horizontal` or `vertical`.  
- `regions.length` must be between 1 and `maxSubRegions`.  
- Each `tabsIds` array must contain unique tab IDs.  
- `activeTabId` must be `null` or contained within that region's `tabsIds`.
