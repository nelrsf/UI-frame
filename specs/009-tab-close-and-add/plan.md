# Implementation Plan: Tab Close and Add

**Branch**: `009-tab-close-and-add` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/009-tab-close-and-add/spec.md`

## Summary

Wire up the existing tab close logic in `TabBarComponent` to the NgRx workspace store so that clicking the close (x) button actually removes tabs from the workspace. The `TabCloseGuard` mechanism (with `beforeClose()`) already exists and handles dirty-tab guard logic — it needs to be connected from the shell component. Additionally, implement a modal picker triggered by the "+" button that lists all registered but unopened tabs with their icons and labels, allowing the user to open a selected tab.

## Technical Context

**Language/Version**: TypeScript 5.7, Angular 19 (standalone components)  
**Primary Dependencies**: NgRx Store 19, NgRx Effects 19, Electron 41  
**Storage**: N/A (in-memory state; workspace persistence is out of scope)  
**Testing**: Jasmine + Karma  
**Target Platform**: Windows/macOS/Linux desktop via Electron  
**Project Type**: Desktop application (Electron shell with Angular presentation layer)  
**Performance Goals**: Modal appears within 200ms; tab close/render with no perceptible delay  
**Constraints**: Must follow Constitution Principle III (Single Reactive Paradigm — NgRx only for state); parent-child communication via Angular @Output(); no new EventBus or pub/sub  
**Scale/Scope**: ~5-15 registered tabs typical; single active tab group ("main") for central workspace region

### Existing Components and State

| Component/Service | Role | Relevant Details |
|---|---|---|
| `TabBarComponent` | Renders tab bar with close buttons and "+" button | Already has `onTabClose()` with guard logic, `tabClosed`/`newTabRequested` outputs, `closeGuards` input |
| `ShellComponent` | Main shell orchestrator | Binds `tabSelected` but NOT `tabClosed` or `newTabRequested` to store |
| `ShellManager` | Composition root for tab registration | `addTab()` creates `TabItem` and dispatches `addShellTab` action |
| `workspace` NgRx slice | Manages dynamic tab groups | Has `closeTab`, `openTab`, `selectTab` actions; `closeTab` removes tab from group |
| `shellContent` NgRx slice | Manages registered shell content | Holds `ShellTab[]` (registered tabs with component types); `activeShellTabId` |
| `TabCloseGuard` | Interface for close interception | `beforeClose(): boolean \| Promise<boolean>` — already implemented in `tab-bar.component.ts` |
| `TabItem` | Tab metadata model | `id`, `label`, `icon`, `closable`, `dirty`, `pinned`, `groupId` |

### Key Integration Points

1. **Close flow**: `TabBarComponent.onTabClose()` → emits `tabClosed` → `ShellComponent` catches → dispatches `closeTab({ tabId, groupId })` to workspace store
2. **Guard flow**: `ShellComponent` must build `closeGuards: Record<string, TabCloseGuard>` map from registered tab components and pass it to `TabBarComponent`
3. **Add flow**: `TabBarComponent.onNewTab()` → emits `newTabRequested` → `ShellComponent` catches → opens modal → user selects → dispatches `openTab` or equivalent

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|---|---|---|
| **Principle I — Clean Architecture** | PASS | Changes confined to presentation layer (shell components) and existing NgRx state slice; no direct Electron/Node API calls |
| **Principle II — Shell-First UX** | PASS | Feature enhances existing TabBar within the shell; no new layout regions introduced |
| **Principle III — Single Reactive Paradigm (NgRx)** | PASS | Tab close flows through `tabClosed` @Output → ShellComponent dispatches `closeTab` NgRx Action; no EventBus or pub/sub introduced |
| **Principle IV — Security/Least Privilege** | N/A | No IPC, no Electron API exposure changes |
| **Principle V — Quality Gates/Traceability** | PASS | Spec has measurable acceptance criteria; plan will generate testable tasks |
| **Constraint — No heavy UI frameworks** | PASS | Modal will use existing Angular component infrastructure; no new framework |
| **Constraint — English in source code** | PASS | All identifiers, comments, and code will use English per constitution |

## Project Structure

### Documentation (this feature)

```text
specs/009-tab-close-and-add/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if applicable)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/
├── shell/
│   ├── components/
│   │   ├── tab-bar/
│   │   │   ├── tab-bar.component.ts       # No changes (close logic already implemented)
│   │   │   ├── tab-bar.component.html     # No changes (markup already correct)
│   │   │   └── tab-bar.component.spec.ts  # Update: add tests for close/add flows
│   │   └── tab-add-modal/                  # NEW: modal component for tab picker
│   │       ├── tab-add-modal.component.ts
│   │       ├── tab-add-modal.component.html
│   │       ├── tab-add-modal.component.css
│   │       └── tab-add-modal.component.spec.ts
│   ├── shell.component.ts                 # Modify: add closeGuards$, tabClosed/newTabRequested handlers, modal state
│   ├── shell.component.html               # Modify: add (tabClosed), (newTabRequested), [closeGuards], modal rendering
│   └── shell-manager.service.ts           # Modify: add optional guard parameter to addTab()
├── core/
│   ├── state/
│   │   ├── workspace/
│   │   │   ├── workspace.actions.ts       # No changes (closeTab/openTab actions already exist)
│   │   │   ├── workspace.reducer.ts       # No changes (reducers already exist)
│   │   │   └── workspace.selectors.ts     # No changes
│   │   └── shell-content/
│   │       ├── shell-content.actions.ts   # Modify: add guard parameter to addShellTab
│   │       ├── shell-content.reducer.ts   # Modify: extend ShellTab with guard field
│   │       └── shell-content.selectors.ts # Add: selectShellCloseGuards selector
│   └── models/
│       └── tab-item.model.ts              # No changes (TabCloseGuard already defined)
└── app/
    └── app.config.ts                      # No changes
```

**Structure Decision**: Single project (Angular workspace). All changes are within `src/app/shell/` for components and `src/app/core/state/` for selectors. No new modules or packages needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. All changes align with existing patterns.
