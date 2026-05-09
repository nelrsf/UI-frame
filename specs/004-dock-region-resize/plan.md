# Implementation Plan: Dock Region Resize

**Branch**: `004-dock-region-resize` | **Date**: 2026-05-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-dock-region-resize/spec.md`

## Summary

Implement resize interactions only for internal dock-region boundaries affecting
Bottom Panel, Secondary Panel (auxiliary), and Primary Workspace sizing, while
explicitly excluding Sidebar, Activity Bar, Toolbar, Status Bar, and native
window edges. Changes are committed to NgRx only on drag end, emitted through a
typed EventBus resize event, clamped by per-region min/max pixel limits, and
documented for future consumers.

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Language/Version** | TypeScript 5.7, Angular 19 |
| **Primary Dependencies** | `@angular/core`, `@ngrx/store`, `rxjs`, existing `EventBusService`, `ShellComponent`/shell region components |
| **Storage** | In-memory NgRx `layout` slice now; persisted workspace/session integration in existing services (future persistence consume-ready) |
| **Testing** | Jasmine + Karma (`npm test`, `npm run test:shell`) |
| **Target Platform** | Electron desktop renderer (Angular shell) |
| **Project Type** | Desktop shell application |
| **Performance Goals** | Commit-phase dispatch/event under 16ms per interaction end; no visible jank during drag previews; preserve shell responsiveness baseline |
| **Constraints** | Resize must not activate on Sidebar/ActivityBar/Toolbar/StatusBar or external window borders; state/event units are integer pixels; EventBus listener failures must remain isolated |
| **Scale/Scope** | 3 resizable dock regions (Bottom, Secondary, Workspace derived), 1 normalized resize event contract, layout state and shell interaction updates, focused unit/integration coverage |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Principle | Status | Notes |
|------|-----------|--------|-------|
| C1 | I. Official Stack and Layer Boundaries | PASS | Work stays in Angular presentation + existing app state/services; no direct Electron/OS API usage added. |
| C2 | II. Shell-First UX Contract | PASS | Feature refines shell dock behavior without changing shell region taxonomy. |
| C3 | III. State, Commands, and Events Discipline | PASS | Resize commits route through NgRx layout slice and typed EventBus contract. |
| C4 | IV. Security and Least Privilege | PASS | Renderer-only interaction updates; no preload/IPC scope expansion. |
| C5 | V. Quality Gates and Traceability | PASS | FRs map to research, data model, contracts, quickstart, and planned tests. |

**Post-design re-check (Phase 1)**: PASS. Produced data model and contracts preserve typed eventing, state boundaries, and shell-only scope.

## Project Structure

### Documentation (this feature)

```text
specs/004-dock-region-resize/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── IRegionResizeEvent.ts
│   ├── index.ts
│   └── dock-region-resize.contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── models/
│   │   └── app-event.model.ts                         # add typed resize event name/payload
│   └── state/
│       └── layout/
│           ├── layout.actions.ts                      # commit-phase resize actions
│           ├── layout.reducer.ts                      # per-region min/max clamp
│           └── layout.selectors.ts                    # region dimensions for render/layout
├── shell/
│   ├── shell.component.ts                             # pointer drag orchestration + commit dispatch/event emit
│   ├── shell.component.html                           # resize handles at allowed dock boundaries only
│   ├── components/
│   │   ├── bottom-panel/                              # receives committed height only
│   │   ├── secondary-panel/                           # receives committed width only
│   │   └── content-area/                              # workspace region grows/shrinks as derived space
│   └── shell.component.spec.ts                        # integration coverage for allowed/forbidden resize behavior
└── styles.css / shell.component.css                   # native cursor states + handle hit zones
```

**Structure Decision**: Single Angular/Electron shell project. Reuse existing `layout` state slice and `EventBusService` rather than introducing a new store slice or interaction service.

## Phase 0: Research (Complete)

Research outcomes are documented in [research.md](research.md), covering:

1. Commit-only resize architecture (local drag preview + NgRx/EventBus commit on pointer-up).
2. Dock-boundary ownership rules to enforce no-resize regions.
3. Typed event contract strategy (`shell.region.resized.v1`) aligned with existing event versioning.
4. Per-region pixel clamp policy and reducer compatibility.

## Phase 1: Design & Contracts (Complete)

Artifacts produced:

1. [data-model.md](data-model.md) with resize interaction lifecycle, layout state entities, and validation rules.
2. [contracts/IRegionResizeEvent.ts](contracts/IRegionResizeEvent.ts) and [contracts/dock-region-resize.contract.md](contracts/dock-region-resize.contract.md).
3. [quickstart.md](quickstart.md) with implementation flow and validation commands.

## Requirement Coverage Map

| Requirement | Design Element |
|-------------|----------------|
| FR-001 | Bottom dock splitter handle + committed `bottomPanelHeight` update |
| FR-002 | Secondary dock splitter handle + committed `secondaryPanelWidth` update |
| FR-003 | Workspace dimension derivation from bottom/secondary committed sizes |
| FR-004 | No resize handles/listeners in Sidebar, Activity Bar, Toolbar, Status Bar |
| FR-005 | No interception of window frame edges; resize scope restricted to internal shell handles |
| FR-006 | Native `ns-resize` / `ew-resize` cursor on valid splitter hover |
| FR-007 | Cursor reset outside valid splitter hit zones |
| FR-008 | Reducer-level per-region min/max clamp in integer pixels |
| FR-009 | Local transient drag state with NgRx dispatch only on commit |
| FR-010 | EventBus emit once per valid commit with typed region resize payload |
| FR-011 | Event contract files + quickstart consumption guidance |
| FR-012 | Existing EventBus listener error isolation retained and verified |
| FR-013 | State + event payload dimensions constrained to integer pixels |

## Complexity Tracking

No constitutional violations or complexity exemptions required.

## Implementation Traceability (spec 004 complete)

| Task | File Modified | Status |
|------|---------------|--------|
| T004 | `src/app/core/models/app-event.model.ts` | Done — `DockRegionId`, `shell.region.resized.v1` added |
| T006 | `src/app/core/state/layout/layout.reducer.ts` | Done — `Math.round()` in height/width handlers |
| T009 | `src/app/core/state/layout/layout.spec.ts` | Done — integer normalization tests |
| T010 | `src/app/core/services/event-bus.service.spec.ts` | Done — isolation regression test |
| T011-T013 | `src/app/shell/shell.component.spec.ts` | Done — US1 drag commit tests |
| T014 | `src/app/shell/shell.component.html` | Done — splitter handle elements |
| T015-T017 | `src/app/shell/shell.component.ts` | Done — drag lifecycle, NgRx commits |
| T018 | `src/app/shell/shell.component.html` | Done — draft CSS vars via BehaviorSubject |
| T019 | `src/app/shell/shell.component.css` | Done — grid updated, splitter hit zones |
| T020-T022, T037 | `src/app/shell/shell.component.spec.ts` | Done — US2 cursor tests |
| T023-T025 | `src/app/shell/shell.component.css` | Done — cursor styles, forbidden regions |
| T026-T028 | `src/app/shell/shell.component.spec.ts` | Done — US3 EventBus emission tests |
| T029-T030 | `src/app/shell/shell.component.ts` | Done — emit shell.region.resized.v1 |
| T031 | `src/app/core/models/app-event.model.ts` | Done — JSDoc on event payload |
| T032 | `specs/004-dock-region-resize/contracts/dock-region-resize.contract.md` | Done — implementation status section |
| T038 | `scripts/electron-smoke.mjs` | Done — resize no-interference soft check |
