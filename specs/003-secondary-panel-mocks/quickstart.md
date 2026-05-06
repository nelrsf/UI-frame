# Quickstart: Validate Secondary Panel Mock Modules

**Feature**: 003-secondary-panel-mocks  
**Date**: 2026-05-05

## Objective

Implement and validate two free-content mock entries (Weather and Market) in the shell secondary panel, with deterministic active-entry behavior and layout-safe collapse/expand handling.

## Prerequisites

- Node dependencies installed (`npm install`).
- Existing shell baseline compiles and tests run locally.
- Feature branch checked out: `003-add-secondary-panel-mocks`.

## Implementation Flow

1. Define/update secondary registration contract:
- Add or extend secondary panel entry interface in shell contracts.
- Ensure entry includes `id`, `label`, optional `icon`, and `component`.

2. Extend shell registration/state wiring:
- Add secondary entry registration path in `ShellManager`.
- Extend shell-content actions/reducer/selectors to store secondary entries and active secondary id.

3. Render active secondary component dynamically:
- Update `SecondaryPanelComponent` to resolve and render active entry via `NgComponentOutlet`.
- Keep one active content view at a time.

4. Add mock modules and fake data:
- Create Weather and Market mock components under shell mock-ui area.
- Keep all datasets fake-only and local.

5. Register mocks at bootstrap:
- Ensure mock initializer registers both secondary entries.
- Apply deterministic default: Weather active on first open when both entries exist.

6. Implement invalid-entry fallback:
- If active entry becomes invalid, auto-fallback to another valid entry.
- If none available, keep panel visible and show controlled empty state.

7. Preserve shell layout behavior:
- Verify collapse/expand still redistributes shell regions without gaps or overlaps.

## Manual Validation Checklist

1. Open app shell and expand secondary panel.
2. Confirm two selectable entries exist: Weather and Market.
3. Confirm first open selects Weather by default.
4. Switch entries repeatedly and verify only one view is visible at a time.
5. Collapse panel and verify adjacent regions reclaim width.
6. Re-expand panel and verify active entry remains valid.
7. Simulate missing/invalid active entry and verify fallback behavior.
8. Simulate no entries available and verify visible controlled empty state.

## Automated Test Commands

```bash
npm run test:shell
npm test
```

## Manual Run Command

```bash
npm start
```

## Expected Outcome

- All clarified requirements (FR-001 to FR-010) are covered by implementation and verifiable behavior.
- Secondary panel supports dynamic, fake-content module validation without route changes or external dependencies.
