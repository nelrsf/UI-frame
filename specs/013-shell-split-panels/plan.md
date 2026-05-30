# Implementation Plan: Shell Split Panels

**Branch**: `specs/013-shell-split-panels` | **Date**: 2026-05-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-shell-split-panels/spec.md`

## Summary

Implement a new shell wrapper component, `layout-splittable-panel`, that composes one or more existing `app-dock-zone-panel` instances into a split layout. This wrapper will support `direction` (horizontal/vertical), a configurable `maxSubRegions`, and a cyclic render pattern of dock zone + separator + dock zone. The feature applies to the central primary workspace tabs and the bottom panel, and it persists the split region model in NgRx state so split configuration restores after restart.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19.2.21  
**Primary Dependencies**: Angular, NgRx 19.2.1, RxJS 7.8.0, Electron 41.3.0  
**Storage**: N/A for feature-specific storage; existing shell layout persistence remains responsible for saved workspace sessions  
**Testing**: Jasmine + Karma unit tests, Angular test harnesses  
**Target Platform**: Electron desktop shell (Windows, macOS, Linux)  
**Project Type**: Desktop application shell (Electron + Angular)  
**Performance Goals**: Split and pane update actions should render responsively with sub-50ms UI updates; state persistence should not degrade shell start-up.  
**Constraints**: Must reuse existing `DockZonePanelComponent` without modifying its core tab presentation behavior. Split state updates must flow through NgRx Actions/Reducers/Selectors only, per constitution principle III. No new cross-component event bus may be introduced.  
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
- `layout-splittable-panel` should expose `direction`, `regions`, and `maxSubRegions`; `regions` carries per-pane tab routing data and active tab state.

## Phase 1: Design & Contracts

### Data Model

**LayoutSplitDirection**

| Value | Description |
|-------|-------------|
| `horizontal` | Bottom-panel split orientation (stacked top/bottom). |
| `vertical` | Primary workspace split orientation (side-by-side). |

**LayoutSplitSubRegion**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Stable pane identifier. |
| `tabsIds` | `string[]` | Ordered tab IDs for the pane. |
| `activeTabId` | `string | null` | Active tab within the pane. |
| `visible` | `boolean` | Whether the pane is shown. Defaults to `true`. |
| `size` | `number | undefined` | Optional committed pane size in the split axis. |

**LayoutSplittableRegionModel**

| Field | Type | Description |
|-------|------|-------------|
| `direction` | `LayoutSplitDirection` | Split orientation. |
| `regions` | `LayoutSplitSubRegion[]` | Pane definitions in the split layout. |
| `maxSubRegions` | `number` | Maximum allowed panes for this wrapper. |

### NgRx Contract

- Add `setSplitLayout` and `setSplitPaneSize` actions to `layout.actions.ts`.  
- Extend `LayoutState` in `layout.reducer.ts` to include `splitPanelLayout: LayoutSplittableRegionModel | null`.  
- Add selectors in `layout.selectors.ts` for split layout and pane sizes.

### Component Contract

`layout-splittable-panel` should expose:
- Inputs: `direction`, `regions`, `maxSubRegions`  
- Outputs: `regionsChange`, `splitRequested`, `paneSizeChange`

This wrapper renders the cyclic pattern of `app-dock-zone-panel` and separators exactly as required by the spec.

## Quickstart

1. Create `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts`.  
2. Add wrapper template and styling for cyclic pane + separator rendering.  
3. Extend `src/app/core/state/layout/layout.actions.ts`, `layout.reducer.ts`, and `layout.selectors.ts` with split layout state.  
4. Update `src/app/shell/shell.component.html` to render primary workspace and bottom panel through `app-layout-splittable-panel` when split mode is active.  
5. Ensure each rendered `app-dock-zone-panel` continues to register with `DragDropService` for tab ordering.  
6. Add unit tests for split button behavior, `maxSubRegions` disablement, and region model emission.  
7. Add shell-level verification that split layout restores from NgRx on reload.

---

## Implementation Notes

- Keep `DockZone` fixed and treat split panes as multiple subregions inside a single zone.  
- Use `layout-splittable-panel` as the split owner; do not modify `DockZonePanelComponent` to add split responsibility.  
- The split button icon must change based on `direction` and disable at `maxSubRegions`.  
- Use NgRx for all split state persistence and shell layout restore behavior.

## Next Step

Create `tasks.md` to map each functional requirement to implementation and verification tasks once the plan is approved.
