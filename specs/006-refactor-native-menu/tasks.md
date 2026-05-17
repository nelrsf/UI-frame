# Tasks: Native Menu Refactoring

**Branch**: 006-refactor-native-menu | **Generated**: 2026-05-17

## Summary

Refactorizar la integracion del menu nativo de Electron con foco en SRP para `main.ts` y OCP para la personalizacion del menu.

- **Total Tasks**: 29
- **User Stories**: 4 (P1, P2, P3, P4)
- **Parallel Opportunities**: 6 tasks marked with [P]
- **MVP Scope**: User Story 1 (P1) - Bootstrap liviano para Electron

---

## Phase 1: Setup

**Goal**: Create directory structure for new modules.

- [ ] T001 Create directory `src/electron/preferences/` for PreferenceStore module
- [ ] T002 Create directory `src/electron/theme/` for ThemeInitializer module
- [ ] T003 Create directory `src/electron/lifecycle/` for LifecycleSignals module

---

## Phase 2: Foundational

**Goal**: Create shared modules required by all user stories.

- [ ] T004 [P] Implement PreferenceStore in `src/electron/preferences/preference-store.ts`
- [ ] T005 [P] Implement ThemeInitializer in `src/electron/theme/theme-initializer.ts`
- [ ] T006 Create shell handler module in `src/electron/ipc/handlers/shell.handlers.ts`
- [ ] T007 Create lifecycle signals module in `src/electron/lifecycle/signals.ts`

**Independent Test**: Verify modules can be imported without errors; basic method signatures work.

---

## Phase 3: User Story 1 - Bootstrap liviano para Electron (P1)

**Goal**: Extract all inline logic from main.ts into modular handlers; ensure bootstrap only orchestrates.

**Independent Test**: Review `main.ts` confirms it only orchestrates modules, no inline IPC handlers, no direct preference file access, no menu instantiation logic.

### Implementation

- [ ] T008 [US1] Refactor `main.ts` to use PreferenceStore instead of direct fs.readFileSync for theme
- [ ] T009 [US1] Refactor `main.ts` to use ThemeInitializer instead of inline getStoredTheme()
- [ ] T010 [US1] Move SHELL.OPEN_EXTERNAL handler to shell.handlers.ts module
- [ ] T011 [US1] Move MENU.UPDATE_PANEL_STATE handler to menu.handlers.ts module
- [ ] T012 [US1] Refactor `main.ts` to use registerShellHandlers() for shell IPC
- [ ] T013 [US1] Implement registerMenuHandlers() in `src/electron/ipc/handlers/menu.handlers.ts`
- [ ] T014 [US1] Move smoke/accessibility signals to lifecycle/signals.ts module
- [ ] T015 [US1] Refactor `main.ts` to call emitShellSignals() after window load
- [ ] T016 [US1] Create MenuInitializer in `src/electron/menu/menu.initializer.ts` that orchestrates menu setup
- [ ] T016a [P] [US1] Update MenuManager to accept injected configuration or factory (FR-011)
- [ ] T016b [US1] Verify custom menu actions propagate errors to upper handler (FR-015)

---

## Phase 4: User Story 2 - Personalizacion de menu por extension estable (P2)

**Goal**: Establish stable extension point (menu.config.ts) for menu customization without modifying main.ts.

**Independent Test**: Apply customization to change labels, add submenu, hide optional entry, connect custom action without editing main.ts.

### Implementation

- [ ] T017 [P] [US2] Create MenuConfig extension point in `src/electron/menu/menu.config.ts`
- [ ] T018 [P] [US2] Export IMenuConfig and default menu configuration from menu.config.ts
- [ ] T019 [US2] Update MenuBuilder to accept configuration from menu.config.ts
- [ ] T020 [US2] Verify MenuBuilder respects mandatory rules (file.exit not hidden, themes.light disabled, view.devtools in dev only)

---

## Phase 5: User Story 3 - Preferencias y tema inicial reutilizables (P3)

**Goal**: Ensure theme and preferences modules are reusable by handlers and bootstrap.

**Independent Test**: Start app with existing preferences, missing preferences, and corrupt preferences - all scenarios work without crash.

### Implementation

- [ ] T021 [P] [US3] Update preferences.handlers.ts to use PreferenceStore instead of direct file access
- [ ] T022 [US3] Ensure ThemeInitializer handles all edge cases (missing, null, invalid, corrupt preferences.json)
- [ ] T023 [US3] Verify both ThemeInitializer and preferences.handlers use the same PreferenceStore instance

---

## Phase 6: User Story 4 - Documentacion que guia hacia OCP (P4)

**Goal**: Update quickstart and documentation to reference menu.config.ts as extension point, not main.ts.

**Independent Test**: Follow quickstart to customize menu without editing main.ts in under 15 minutes.

### Implementation

- [ ] T024 [P] [US4] Update `specs/005-native-menu-customization/quickstart.md` to reference menu.config.ts
- [ ] T025 [P] [US4] Remove references to editing main.ts from quickstart
- [ ] T026 [US4] Add this feature's quickstart (specs/006-refactor-native-menu/quickstart.md) to key files reference in existing docs

---

## Phase 7: Polish & Cross-Cutting

**Goal**: Ensure all tests pass and refactoring is complete.

### Implementation

- [ ] T027 Update existing tests to cover new module structure and verify separation of concerns

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ──────► T004, T005, T006, T007
    │                               │
    ▼                               ▼
Phase 3 (US1) ◄──────────────── T008-T016 depend on T004, T005, T006, T007
    │
    ▼
Phase 4 (US2) ◄────────────── T017-T020 depend on Phase 3 completion
    │
    ▼
Phase 5 (US3) ◄────────────── T021-T023 depend on T004, T005
    │
    ▼
Phase 6 (US4) ◄────────────── T024-T026 independent (documentation only)
    │
    ▼
Phase 7 (Polish) ◄─────────── T027 depends on all previous phases
```

---

## Parallel Execution Opportunities

| Task | Reason for Parallel |
|------|---------------------|
| T001, T002, T003 | Independent directory creation |
| T004, T005, T006, T007 | Independent module implementations |
| T017, T018 | Both in menu config, no dependencies between them |
| T024, T025 | Both documentation updates, no dependencies between them |

---

## MVP Scope Recommendation

**Recommended MVP**: Phase 3 (User Story 1) only.

**Rationale**:
- US1 is the foundation - without clean bootstrap, other stories cannot succeed
- US1 validates the core refactoring: main.ts becomes a simple orchestrator
- US2-US4 can be added incrementally after US1 is tested

**MVP Tasks**: T001-T016 (16 tasks)

---

## Validation

All tasks follow the checklist format:
- [ ] Checkbox present
- [ ] Task ID (T001-T027)
- [ ] [P] marker for parallelizable tasks
- [ ] [US1]-[US4] labels for user story phase tasks
- [ ] File path included in description