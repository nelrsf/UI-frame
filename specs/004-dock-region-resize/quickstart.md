# Quickstart: Implement Dock Region Resize

**Feature**: 004-dock-region-resize  
**Date**: 2026-05-07

## Goal

Implement commit-based resize for Bottom and Secondary dock boundaries, with workspace resizing as a derived layout effect, while publishing typed EventBus notifications.

## Prerequisites

- Feature branch: `004-dock-region-resize`
- Active spec: `specs/004-dock-region-resize/spec.md`
- Plan + contracts in this folder
- Node dependencies installed

## Regression Baseline (SC-005)

Use this fixed baseline to evaluate no-regression criteria for this feature:

- Shell integration specs (`src/app/shell/**/*.spec.ts`)
- Layout state specs (`src/app/core/state/layout/**/*.spec.ts`)
- Electron smoke scenario (`scripts/electron-smoke.mjs`)

## Implementation Flow

1. Extend event catalog in `src/app/core/models/app-event.model.ts`.
- Add `shell.region.resized.v1` to `AppEventName`.
- Add strongly typed payload matching `IRegionResizeEvent` shape.

2. Update layout state boundaries in `src/app/core/state/layout/`.
- Keep region-specific min/max constants for bottom and secondary dimensions.
- Ensure commit values are integer-clamped in reducer.

3. Implement splitter interaction wiring in `src/app/shell/shell.component.html` and `src/app/shell/shell.component.ts`.
- Add dedicated internal splitter handles only where resize is allowed.
- Keep drag-state local in component during pointer move.
- Dispatch `setBottomPanelHeight` / `setSecondaryPanelWidth` only at pointer-up commit.
- Emit `shell.region.resized.v1` once per committed resize.

4. Ensure forbidden regions are non-resizable.
- Do not add drag handlers to sidebar/activity bar/toolbar/status bar.
- Keep existing window-edge behavior untouched (no overlay interception near external edges).

5. Apply cursor feedback in shell styles.
- `ns-resize` for bottom splitter.
- `ew-resize` for secondary splitter.
- Default cursor elsewhere.

6. Add/update tests.
- `layout.reducer` specs for clamp behavior and integer normalization.
- `shell.component.spec.ts` integration specs:
  - commit-only NgRx dispatch behavior,
  - exactly one EventBus emission per commit,
  - no resize actions from forbidden regions,
  - cursor class/attribute behavior on splitter hover.
  - cursor feedback latency verification under 100 ms for allowed splitter hover.
- `electron-smoke.mjs` check for no interference with native window-edge resize behavior.

## Validation Commands

```bash
# Run shell integration tests (covers US1, US2, US3 splitter behavior)
npm run test:shell

# Run layout state unit tests (integer normalization, per-region clamping)
npm test -- --watch=false --include='src/app/core/state/layout/**/*.spec.ts'

# Run EventBus isolation regression test
npm test -- --watch=false --include='src/app/core/services/event-bus.service.spec.ts'

# Run electron smoke validation
npm run test:smoke
```

## Expected Verification Outcomes

- Bottom and Secondary panel dimensions commit correctly with bounded integer pixel values.
- Workspace dimensions adapt visually as a derived result.
- EventBus emits `shell.region.resized.v1` with valid payload once per commit.
- No forbidden region resize behavior is observed.
