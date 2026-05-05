# Contract: Mock UI Validation Screen

## Purpose

Define the acceptance contract for the dedicated mock screen used to validate UI Frame behavior without product logic or external integrations.

## Screen Access Contract

- The application must expose a dedicated test screen or route for mock UI validation.
- Accessing this surface must not replace or mutate the default production shell flow.

## Required Regions Contract

The mock screen must render all regions below in one validation session:

- Sidebar (mock navigation items)
- Toolbar (mock alerts/messages)
- Content area with two tabs:
  - Dashboard tab
  - Reports list tab
- Bottom results panel

## Interaction Contract

- Tab switching between Dashboard and Reports must update displayed content deterministically.
- If any mock collection is empty, the corresponding region must render an explicit empty state.
- No external network/backend dependency is allowed for rendering this screen.

## Data Contract (Fixture Shapes)

- Sidebar item:
  - id, label, active
- Toolbar alert:
  - id, level, message, visible
- Bottom result:
  - id, source, status, summary
- Dashboard card:
  - id, title, value
- Report row:
  - id, reportName, owner, state

All fixture values are fake-only and must be identifiable as non-production data.

## Isolation Contract

- All mock modules and fixture data must be under one dedicated shell folder.
- Production modules must not import mock fixtures unless explicitly scoped to the dedicated mock screen.

## Documentation Contract

- A dedicated implementation guide must exist in this feature folder.
- README must reference that guide so contributors can discover it quickly.

## Review Contract

A contribution for this feature is acceptable only if:

- It preserves route/screen isolation.
- It keeps all fake artifacts in the dedicated mock folder.
- It does not add business logic or persistence dependencies.
- It keeps required regions and tab behavior working.
