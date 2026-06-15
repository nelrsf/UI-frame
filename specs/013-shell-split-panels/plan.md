# Implementation Plan: Shell Split Panels

**Branch**: `specs/013-shell-split-panels` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-shell-split-panels/spec.md`

## Summary

Implement a new shell wrapper component, `layout-splittable-panel`, that composes multiple existing `app-dock-zone-panel` instances into a split-grid layout managed by a 2D state matrix of panel visibilities. This wrapper supports `direction` (horizontal/vertical) for split boundaries, `zones` input representing the 2D grid of active dock zones, and dynamically toggling the visibility of individual panes. Separation and resizing boundaries are handled by `app-shell-splitter-handle`.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19.2.21  
**Primary Dependencies**: Angular, NgRx 19.2.1, RxJS 7.8.0, Electron 41.3.0  
**Storage**: N/A for feature-specific storage; existing shell layout persistence remains responsible for saved workspace sessions  
**Testing**: Jasmine + Karma unit tests, Angular test harnesses  
**Target Platform**: Electron desktop shell (Windows, macOS, Linux)  
**Project Type**: Desktop application shell (Electron + Angular)  
**Performance Goals**: Split and pane update actions should render responsively with sub-50ms UI updates; state persistence should not degrade shell start-up.  
**Constraints**: Must reuse existing `DockZonePanelComponent` without modifying its core tab presentation behavior. Split state updates flow through NgRx Actions/Reducers/Selectors only. No new cross-component event bus may be introduced.  
**Scale/Scope**: Shell-level feature within the existing Electron/Angular MVP.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution Principle | Status | Notes |
|---|---|---|
| I. Official Stack and Layer Boundaries | PASS | Uses the existing shell layer and Angular/Electron architecture. |
| II. Shell-First UX Contract | PASS | Enhances shell workspace and bottom panel layout without adding non-shell features. |
| III. Single Reactive Paradigm (NgRx) | PASS | Split configuration flows through NgRx state; no EventBus introduced. |
| IV. Security and Least Privilege | PASS | UI-only feature; no Electron or IPC changes required. |
| V. Quality Gates and Traceability | PASS | Requirements are testable and traceable to shell state updates. |
| Docking MVP Scope | PASS | Uses fixed zones inside existing shell regions; does not add floating or arbitrary nested layouts. |
| Language/Code Conventions | PASS | Implementation will use English identifiers in code.

## Project Structure

### Documentation (this feature)

```text
specs/013-shell-split-panels/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/
├── shell/
│   ├── components/
│   │   ├── dock-zone-panel/
│   │   │   ├── dock-zone-panel.component.ts
│   │   │   ├── dock-zone-panel.component.html
│   │   │   └── dock-zone-panel.component.css
│   │   └── layout-splittable-panel/
│   │       ├── layout-splittable-panel.component.ts
│   │       ├── layout-splittable-panel.component.html
│   │       └── layout-splittable-panel.component.css
│   ├── services/
│   │   └── drag-drop.service.ts
│   └── shell.component.ts
├── core/
│   ├── models/
│   │   └── dock-zone-assignment.model.ts
│   └── state/
│       └── layout/
│           ├── layout.actions.ts
│           ├── layout.reducer.ts
│           └── layout.selectors.ts
```

**Structure Decision**: Single Angular/Electron shell project. The new split feature is implemented in the existing shell layer using a wrapper component and a layout state extension. No additional top-level project modules are required.

## Complexity Tracking

> No constitution violations are present for this feature.

## Phase 0: Research

### Research Tasks

1. Confirm `DockZonePanelComponent` remains unchanged and is reused by the new wrapper.  
2. Verify existing drag reorder registration in `DockZonePanelComponent` supports multiple pane instances.  
3. Determine the NgRx layout state shape for persisted split configuration.  
4. Define how split orientation and `maxSubRegions` are represented by `layout-splittable-panel`.

### Research Findings

- `DockZonePanelComponent` is the passive pane renderer. The split behavior belongs to `layout-splittable-panel`.  
- Existing `DragDropService.registerReorderSource()` can register each split pane independently.  
- The existing layout state slice is the best persistence boundary for split models because shell layout restore already uses NgRx state.  
- `layout-splittable-panel` exposes `direction`, `zones` (as a 2D matrix), and split configuration properties, managing panel visibility internally through `panelStates`.

## Phase 1: Design & Contracts

### Data Model

**LayoutSplitDirection**

| Value | Description |
|-------|-------------|
| `horizontal` | Split direction for horizontal layout panels. |
| `vertical` | Split direction for vertical layout panels. |

**PanelState (Local Component State)**

| Field | Type | Description |
|-------|------|-------------|
| `visible` | `boolean` | Current visibility of this cell panel. |
| `zone` | `DockZone` | Associated dock zone for the panel. |
| `row` | `number` | Row index in the 2D layout grid. |
| `column` | `number` | Column index in the 2D layout grid. |

### Component Contract

`layout-splittable-panel` exposes:
- **Inputs**:
  - `direction: LayoutSplitDirection`
  - `zones: Array<DockZone[]>` (Predefined 2D matrix layout of dock zones)
  - `visible: boolean`
  - `showVerticalSplitButton: boolean`
  - `showHorizontalSplitButton: boolean`
  - `showClose: boolean`
- **Outputs**:
  - `closePanel: EventEmitter<boolean>`

This wrapper renders the grid of `app-dock-zone-panel` instances, separated by resizable `app-shell-splitter-handle` instances.

## Quickstart

1. Modify `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts` to implement 2D `panelStates` grid visibility control and split actions.
2. In `layout-splittable-panel.component.html`, loop over rows and columns of `panelStates` with conditional rendering of splitter handles.
3. Update `src/app/shell/shell.component.html` to integrate `app-layout-splittable-panel` in both the primary workspace (using a 2x2 grid of workspace zones) and the bottom panel (using a 1x3 grid of bottom zones).
4. Implement reactive integration with NgRx selectors (`selectShellTabs`, `selectActiveIds`) and actions (`moveTabToZone`, `selectTab`).
5. Ensure each rendered `app-dock-zone-panel` correctly registers with `DragDropService` for dynamic drag-and-drop support.
6. Add unit tests for `LayoutSplittablePanelComponent` verifying splitting, panel visibility, close events, and tab migration.

---

## Implementation Notes

- Keep `DockZone` fixed and treat split panes as multiple subregions inside a single zone.  
- Use `layout-splittable-panel` as the split owner; do not modify `DockZonePanelComponent` to add split responsibility.  
- The split button icon must change based on `direction` and disable at `maxSubRegions`.  
- Use NgRx for all split state persistence and shell layout restore behavior.

## Next Step

Create `tasks.md` to map each functional requirement to implementation and verification tasks once the plan is approved.
