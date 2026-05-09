# Data Model: Dock Region Resize

**Feature**: 004-dock-region-resize  
**Date**: 2026-05-07

## Entity: DockRegion

Represents a shell region classification for resize semantics.

| Field | Type | Required | Notes |
|---|---|---|---|
| id | `DockRegionId` | Yes | Enum-like id: `bottom-panel`, `secondary-panel`, `primary-workspace` |
| resizable | `boolean` | Yes | True only for feature-allowed regions |
| axis | `'vertical' | 'horizontal'` | Yes | Defines splitter orientation for cursor + delta interpretation |

Validation rules:
- `sidebar`, `activity-bar`, `toolbar`, `status-bar` are always non-resizable in this feature.
- External window edges are excluded from this model and remain native Electron behavior.

## Entity: RegionDimensionState

Committed dimensions persisted in layout state.

| Field | Type | Required | Notes |
|---|---|---|---|
| regionId | `DockRegionId` | Yes | Region owner |
| valuePx | `number` | Yes | Integer pixels only |
| minPx | `number` | Yes | Region-specific lower bound |
| maxPx | `number` | Yes | Region-specific upper bound |

Validation rules:
- `valuePx` MUST be clamped to `[minPx, maxPx]` in reducer.
- Non-integer values are normalized to integer pixels before persistence/event payload.

## Entity: ResizeInteraction

Transient interaction state for pointer drag lifecycle.

| Field | Type | Required | Notes |
|---|---|---|---|
| interactionId | `string` | Yes | Ephemeral id for traceability/logging |
| regionId | `DockRegionId` | Yes | Region currently being resized |
| startPx | `number` | Yes | Dimension at pointer-down |
| draftPx | `number` | Yes | Local preview during drag |
| committedPx | `number` | No | Final value on commit |
| phase | `'idle' | 'dragging' | 'committed' | 'cancelled'` | Yes | Lifecycle state |

State transitions:
1. `idle -> dragging`: pointer-down on valid splitter.
2. `dragging -> committed`: pointer-up with valid value, dispatch NgRx update, emit EventBus resize event.
3. `dragging -> cancelled`: pointer-cancel/escape/unexpected interruption, no global commit.
4. `committed -> idle`: cleanup transient state.

## Entity: RegionResizeEvent

Typed EventBus payload for committed resize.

| Field | Type | Required | Notes |
|---|---|---|---|
| regionId | `DockRegionId` | Yes | `bottom-panel` or `secondary-panel` as direct source; `primary-workspace` as derived effect |
| widthPx | `number | null` | Conditionally | Integer width where applicable |
| heightPx | `number | null` | Conditionally | Integer height where applicable |
| source | `'user-drag'` | Yes | Source classification for this feature scope |
| committedAt | `number` | Yes | Epoch milliseconds |

Validation rules:
- Event emitted once per committed interaction.
- Payload dimensions must match committed layout values in NgRx.
- Event emission failures in one listener must not affect others (existing EventBus isolation guarantee).
