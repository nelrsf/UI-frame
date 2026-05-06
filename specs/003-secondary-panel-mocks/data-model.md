# Data Model: Secondary Panel Mock Modules

**Feature**: 003-secondary-panel-mocks  
**Date**: 2026-05-05

## Entities

### SecondaryPanelEntry (registration entity)

Represents one selectable content entry in the secondary panel.

| Field | Type | Required | Rules |
|---|---|---|---|
| id | string | Yes | Globally unique among secondary entries; duplicates ignored with warning. |
| label | string | Yes | Non-empty; displayed in secondary tab/button UI. |
| icon | string | No | Optional visual marker shown with label. |
| component | Type<unknown> | Yes | Standalone Angular component rendered dynamically when active. |

Relationships:
- One `SecondaryPanelEntry` maps to one secondary-panel content component.
- Secondary panel list contains exactly two entries in this feature scope: Weather and Market.

### SecondaryPanelLayoutState (derived runtime state)

Tracks region visibility and active content identity.

| Field | Type | Required | Rules |
|---|---|---|---|
| visible | boolean | Yes | Controlled by shell layout actions (collapse/expand). |
| width | number | Yes | Existing clamped shell width constraints apply. |
| activeSecondaryEntryId | string \| null | Yes | Must reference existing entry id when entries exist; may be null only when no entries are available. |

Relationships:
- `activeSecondaryEntryId` must be consistent with registered `SecondaryPanelEntry[]`.
- Visibility transitions do not invalidate active entry by themselves.

### WeatherMockView (content entity)

Mock free-content module simulating weather information.

| Field | Type | Required | Rules |
|---|---|---|---|
| entryId | string | Yes | Fixed id matching Weather secondary entry. |
| fakeDataVersion | string | No | Optional marker to identify fake dataset revision. |

### MarketMockView (content entity)

Mock free-content module simulating stock market information.

| Field | Type | Required | Rules |
|---|---|---|---|
| entryId | string | Yes | Fixed id matching Market secondary entry. |
| fakeDataVersion | string | No | Optional marker to identify fake dataset revision. |

## Validation Rules

1. Exactly two mock entries are registered for this feature: Weather and Market.
2. On first opening with both entries available, active entry must be Weather.
3. On active-entry invalidation, system auto-selects another valid entry if available.
4. If no entries are available, panel remains visible and displays controlled empty state.
5. Only one secondary content component is rendered at a time.

## State Transitions

1. Initialization:
- Inputs: registered entries list, current visibility.
- Transition: if first open and Weather exists, set `activeSecondaryEntryId = weather`.

2. Entry switch:
- Trigger: user selects another secondary entry.
- Transition: set `activeSecondaryEntryId` to selected valid id; rerender content outlet.

3. Entry invalidation:
- Trigger: active id removed/unavailable.
- Transition: choose first available valid id in deterministic fallback order; otherwise set null and show empty state.

4. Collapse/expand:
- Trigger: layout visibility actions.
- Transition: `visible` toggles and shell region dimensions adapt; active id remains valid when possible.

## Contract-to-Model Mapping

- `ISecondaryPanelEntry` maps directly to `SecondaryPanelEntry`.
- Selector `activeSecondaryComponentType` resolves component from active entry id.
- Secondary panel view renders `activeSecondaryComponentType` with `NgComponentOutlet`.
