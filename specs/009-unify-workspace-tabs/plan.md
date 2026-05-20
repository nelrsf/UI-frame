# Implementation Plan: Unify Workspace Tab Management

**Branch**: `009-unify-workspace-tabs` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-unify-workspace-tabs/spec.md`

## Summary

Refactor to eliminate the `shellContent` NgRx slice and unify all tab management into the `workspace` slice. The workspace slice will store `componentType` and `closeGuard` directly on each `TabItem`, and three actions (`registerTab`, `openTab`, `registerAndOpenTab` facade) will handle tab lifecycle. ShellComponent will source all tab observables from workspace selectors. The `shellContent` directory (reducer, actions, selectors, index, tests) will be deleted entirely.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19.x, NgRx 19.x  
**Primary Dependencies**: @ngrx/store, @angular/core (Type<unknown>, NgComponentOutlet)  
**Storage**: N/A (in-memory state only, no persistence for tabs)  
**Testing**: Jasmine + Karma (existing test framework for Angular/NgRx)  
**Target Platform**: Desktop (Electron + Angular shell)  
**Project Type**: Desktop application (Electron shell)  
**Performance Goals**: Tab switch < 120 ms (NFR-Perf-02), >30 FPS during resize (NFR-Perf-03)  
**Constraints**: Component types stored in NgRx state require disabled strictStateImmutability (already configured); no breaking changes to ShellManager public API; no breaking changes to ICentralRegionTab contract  
**Scale/Scope**: Single workspace, ~10 concurrent tabs max in MVP; future multi-workspace support is the motivation for this refactor

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justification |
|------|--------|---------------|
| **III. Single Reactive Paradigm** | PASS | All tab state flows through NgRx Actions → Reducers → Selectors. No EventBus, no pub/sub. |
| **I. Official Stack and Layer Boundaries** | PASS | Changes confined to Angular + NgRx presentation layer. No Electron/Node.js involvement. |
| **II. Shell-First UX Contract** | PASS | Shell tab bar, content area, and close behavior are preserved and improved (bug fix). |
| **V. Quality Gates and Traceability** | PASS | Every FR has testable criteria; existing tests will be migrated; new tests added for registerTab action. |
| **Language conventions (English code)** | PASS | All new action names, selectors, and state properties use English. |

## Project Structure

### Documentation (this feature)

```text
specs/009-unify-workspace-tabs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (none needed — existing contracts unchanged)
```

### Source Code (repository root)

```text
src/app/
├── core/
│   └── state/
│       ├── workspace/
│       │   ├── workspace.reducer.ts        # MODIFIED: extend TabGroupState.tabs with componentType/closeGuard
│       │   ├── workspace.actions.ts        # MODIFIED: add registerTab, registerAndOpenTab; modify openTab
│       │   ├── workspace.selectors.ts      # MODIFIED: add selectShellTabs, selectActiveShellTabId, selectActiveShellComponentType, selectShellCloseGuards
│       │   ├── workspace.reducer.spec.ts   # MODIFIED: add tests for new actions/selectors
│       │   └── index.ts                    # MODIFIED: export new actions/selectors
│       ├── shell-content/                  # DELETED: entire directory
│       │   ├── shell-content.reducer.ts
│       │   ├── shell-content.actions.ts
│       │   ├── shell-content.selectors.ts
│       │   ├── shell-content.reducer.spec.ts
│       │   ├── shell-content.selectors.spec.ts
│       │   └── index.ts
│       ├── app.state.ts                    # MODIFIED: remove ShellContentState
│       └── index.ts                        # NO CHANGE (shellContent not re-exported here)
├── shell/
│   ├── shell.component.ts                  # MODIFIED: change imports from shellContent to workspace
│   ├── shell.component.spec.ts             # MODIFIED: update imports if needed
│   ├── shell.component.html                # NO CHANGE (template bindings unchanged)
│   ├── shell-manager.service.ts            # MODIFIED: dispatch registerAndOpenTab instead of addShellTab
│   ├── shell-manager.service.spec.ts       # MODIFIED: update expected dispatched action
│   └── models/
│       └── tab-item.model.ts               # MODIFIED: add componentType and closeGuard properties
```

**Structure Decision**: Single project (Angular/Electron desktop app). Files marked MODIFIED will be changed in-place. The `shell-content/` directory will be deleted entirely. No new directories created.

## Complexity Tracking

> No constitution violations. This refactor simplifies the architecture by removing a redundant state slice.

## Phase 0: Research

See [research.md](./research.md) for resolved technical decisions.

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md) for the extended TabItem model and workspace state shape.
No new contracts needed — `ICentralRegionTab` remains unchanged as the public API.
See [quickstart.md](./quickstart.md) for the developer workflow.
