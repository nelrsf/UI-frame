# Implementation Plan: Unify Workspace Tab Management

**Branch**: `009-unify-workspace-tabs` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-unify-workspace-tabs/spec.md`

## Summary

Refactor to eliminate tab management from the `shellContent` NgRx slice and unify all tab state into the `workspace` slice. The workspace slice will store `componentType` and `closeGuard` directly on each `TabItem`, and three actions (`registerTab`, `openTab`, `registerAndOpenTab` facade) will handle tab lifecycle. A `registeredTabs` array in `TabGroupState` persists all registered tabs (never removed by `closeTab`) so closed tabs can be reopened via the tab-add modal. ShellComponent will source all tab observables from workspace selectors. The `shellContent` slice is retained for non-tab concerns (sidebar entries, toolbar actions, bottom panel tabs, secondary panel entries).

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
│       │   ├── workspace.reducer.ts        # MODIFIED: add registeredTabs, registerTab handler
│       │   ├── workspace.actions.ts        # MODIFIED: add registerTab, registerAndOpenTab
│       │   ├── workspace.selectors.ts      # MODIFIED: add selectShellTabs, selectRegisteredTabsForGroup, selectActiveShellTabId, selectActiveShellComponentType, selectShellCloseGuards
│       │   ├── workspace.reducer.spec.ts   # MODIFIED: add tests for new actions/selectors
│       │   └── index.ts                    # MODIFIED: export new actions/selectors
│       ├── shell-content/                  # RETAINED: non-tab shell content only (sidebar, toolbar, bottom panel, secondary panel)
│       │   ├── shell-content.reducer.ts    # UNCHANGED: tab state removed, non-tab state retained
│       │   ├── shell-content.actions.ts    # UNCHANGED
│       │   ├── shell-content.selectors.ts  # UNCHANGED
│       │   ├── shell-content.reducer.spec.ts # UNCHANGED
│       │   ├── shell-content.selectors.spec.ts # UNCHANGED
│       │   └── index.ts                    # UNCHANGED
│       ├── app.state.ts                    # UNCHANGED: shellContent retained for non-tab state
│       └── index.ts                        # NO CHANGE
├── shell/
│   ├── shell.component.ts                  # MODIFIED: add workspace imports for tab observables, use selectRegisteredTabsForGroup for modal
│   ├── shell.component.spec.ts             # MODIFIED: update imports if needed
│   ├── shell.component.html                # MODIFIED: add tab-add modal binding
│   ├── shell-manager.service.ts            # MODIFIED: dispatch registerAndOpenTab instead of addShellTab
│   ├── shell-manager.service.spec.ts       # MODIFIED: update expected dispatched action
│   ├── models/
│   │   └── tab-item.model.ts               # MODIFIED: add componentType and closeGuard properties
│   └── components/
│       └── tab-add-modal/                  # NEW: modal for selecting closed tabs to reopen
│           ├── tab-add-modal.component.ts
│           ├── tab-add-modal.component.html
│           ├── tab-add-modal.component.css
│           └── tab-add-modal.component.spec.ts
```

**Structure Decision**: Single project (Angular/Electron desktop app). Files marked MODIFIED will be changed in-place. The `shell-content/` directory is RETAINED for non-tab concerns. New `tab-add-modal/` component added for reopening closed tabs.

## Complexity Tracking

> No constitution violations. This refactor simplifies the architecture by removing a redundant state slice.

## Phase 0: Research

See [research.md](./research.md) for resolved technical decisions.

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md) for the extended TabItem model and workspace state shape.
No new contracts needed — `ICentralRegionTab` remains unchanged as the public API.
See [quickstart.md](./quickstart.md) for the developer workflow.
