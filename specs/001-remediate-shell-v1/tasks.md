---
description: "Task list for Shell v1 remediation alignment"
---

# Tasks: Shell v1 Remediation Alignment

**Input**: Design documents from `specs/001-remediate-shell-v1/`
**Prerequisites**: `plan.md`, `spec.md`, `checklists/requirements.md`

**Tests**: Mandatory. This feature requires unit, integration, and Electron smoke coverage to satisfy `FR-Testing`, `DoD-05`, and `NFR-Quality-01`.

**Organization**: Tasks are grouped by phase and user story to preserve the MVP critical path first while still covering all FR/NFR items from the spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when dependencies are satisfied and files do not conflict.
- **[Story]**: User story label for story-specific phases.
- Every task includes the exact file path(s) it must touch.

## MVP Task Sequence

The minimum blocking route to make Shell v1 real and testable follows this sequence:

`T001 -> T002 -> T003 -> T004 -> T005 -> T006 -> T007 -> T008 -> T009 -> T010 -> T011 -> T012 -> T013 -> T014 -> T015 -> T016 -> T017 -> T018 -> T019 -> T020 -> T021 -> T022 -> T023`

This sequence covers governance validity, AppShell mounting, Electron bridge correctness, shell structure, baseline accessibility, and the startup smoke path required by User Story 1. Many intermediate tasks may execute in parallel (marked [P]) after their dependencies complete.

---

## Phase 0: Setup and Governance Baseline [TS-01, TS-02, TS-12, TS-15]

**Purpose**: Freeze the governing artifact set, establish executable validation scripts, and prepare missing shell/state folders without widening scope.

- [x] T001 Verify cross-reference consistency in `.specify/memory/constitution.md`, `specs/001-remediate-shell-v1/spec.md`, `specs/001-remediate-shell-v1/plan.md`, and `.github/copilot-instructions.md`. Ensure all version dates match (2026-04-26), no stale cross-references remain, and precedence order `constitution > spec > plan > tasks` is documented in each artifact.
- [x] T002 Create missing shell and state scaffolding in `src/app/shell/`, `src/app/shell/components/`, `src/app/shell/models/`, `src/app/core/state/`, and `src/app/core/utils/`
- [x] T003 Configure reproducible validation commands in `package.json` (add scripts: `test:shell`, `test:smoke`, `test:coverage`), `README.md` (add invocation and expected output docs), and `scripts/electron-smoke.mjs` (add baseline assertions for app window opening and no startup errors in DevTools console).

**Checkpoint**: Repository points to one canonical constitution and one active feature plan, and the tasking environment has defined smoke entrypoints. ✅ Complete.

**Gate G0**: Canonical governance is clean, AppShell is the target root, preload handlers match exposed preference calls, and startup path has no known blockers. ✅ **Passed.**

---

## Phase 1: Foundational Blocking Prerequisites [TS-04, TS-07, TS-08, TS-09, TS-10]

**Purpose**: Close runtime blockers and establish the contracts every user story depends on.

**⚠️ CRITICAL**: No user story work begins until this phase completes.

- [x] T004 Create typed Electron bridge contracts in `src/app/core/application/ports/electron-api.port.ts`, `src/app/core/application/ports/preferences.port.ts`, and `src/app/core/application/ports/window-controls.port.ts`
- [x] T005 Implement validated IPC channel constants and handlers in `src/electron/ipc/channels.ts`, `src/electron/ipc/handlers/preferences.handlers.ts`, and `src/electron/ipc/handlers/window.handlers.ts`
- [x] T006 Harden preload and main process bridge behavior in `src/electron/preload.ts` and `src/electron/main.ts`
- [x] T007 Add platform and Electron adapters in `src/app/core/infrastructure/electron/adapters/platform.adapter.ts`, `src/app/core/infrastructure/electron/adapters/preferences.adapter.ts`, and `src/app/core/infrastructure/electron/adapters/window-controls.adapter.ts`
- [x] T008 Create root shell state bootstrap in `src/app/app.config.ts`, `src/main.ts`, `src/app/core/state/index.ts`, and `src/app/core/state/app.state.ts`
- [x] T009 Define workspace identity and persistence utilities in `src/app/core/utils/workspace-id.util.ts`, `src/app/core/models/preferences.model.ts`, and `src/app/core/infrastructure/persistence/local-storage/preferences.repository.ts`
- [x] T010 Extend typed event contracts in `src/app/core/models/app-event.model.ts` and `src/app/core/services/event-bus.service.ts`
- [x] T011 Extend centralized command contracts in `src/app/core/models/command-registration.model.ts` and `src/app/core/services/command-registry.service.ts`

**Checkpoint**: Secure bridge, workspace identity, core eventing, and command foundations exist and satisfy Gates `CG-02` through `CG-05`. ✅ Complete.

**Gate G1**: State boundaries, workspace identity, command contract, event contract, and preference envelope are stable. ✅ **Passed.**

---

## Phase 2: User Story 1 - Launch a Real Shell (Priority: P1) 🎯 MVP [TS-02, TS-03, TS-04, TS-11]

**Goal**: Replace the Angular starter page with a real Shell v1 root that renders all mandatory shell regions in a stable desktop-first layout.

**Independent Test**: Launch the app and verify AppShell renders TopBar, Sidebar, Toolbar, TabBar, ContentArea, BottomPanel, and StatusBar with no starter markup remaining and with keyboard-reachable controls.

### Tests for User Story 1

- [x] T012 [P] [US1] Add root bootstrap regression tests in `src/app/app.component.spec.ts` and `src/app/shell/shell.component.spec.ts`
- [x] T013 [P] [US1] Add startup smoke validation for shell visibility in `scripts/electron-smoke.mjs` and `package.json`

### Implementation for User Story 1

- [x] T014 [US1] Replace Angular starter root with AppShell mounting in `src/app/app.component.ts`, `src/app/app.component.html`, `src/app/app.component.css`, and `src/main.ts`
- [x] T015 [P] [US1] Create shell root component contracts in `src/app/shell/shell.component.ts`, `src/app/shell/shell.component.html`, and `src/app/shell/models/layout-region.model.ts`
- [x] T016 [P] [US1] Implement StatusBar component in `src/app/shell/components/status-bar/status-bar.component.ts`, `src/app/shell/components/status-bar/status-bar.component.html`, and `src/app/shell/components/status-bar/status-bar.component.css`. Enable native OS title bar in `src/electron/main.ts` (remove `frame: false` / `titleBarStyle: 'hidden'`).
- [x] T017 [P] [US1] Implement Toolbar and ContentArea components in `src/app/shell/components/toolbar/toolbar.component.ts`, `src/app/shell/components/toolbar/toolbar.component.html`, `src/app/shell/components/toolbar/toolbar.component.css`, `src/app/shell/components/content-area/content-area.component.ts`, `src/app/shell/components/content-area/content-area.component.html`, and `src/app/shell/components/content-area/content-area.component.css`
- [x] T018 [P] [US1] Implement Sidebar and ActivityBar components in `src/app/shell/components/sidebar/sidebar.component.ts`, `src/app/shell/components/sidebar/sidebar.component.html`, `src/app/shell/components/sidebar/sidebar.component.css`, `src/app/shell/components/sidebar/activity-bar/activity-bar.component.ts`, `src/app/shell/components/sidebar/activity-bar/activity-bar.component.html`, and `src/app/shell/components/sidebar/activity-bar/activity-bar.component.css`
- [x] T019 [P] [US1] Implement TabBar and BottomPanel structural components in `src/app/shell/components/tab-bar/tab-bar.component.ts`, `src/app/shell/components/tab-bar/tab-bar.component.html`, `src/app/shell/components/tab-bar/tab-bar.component.css`, `src/app/shell/components/bottom-panel/bottom-panel.component.ts`, `src/app/shell/components/bottom-panel/bottom-panel.component.html`, and `src/app/shell/components/bottom-panel/bottom-panel.component.css`
- [x] T020 [US1] Apply desktop-first shell layout and tokens in `src/app/shell/shell.component.css`, `src/app/themes/variables.css`, `src/app/themes/dark.css`, and `src/styles.css`
- [x] T021 [US1] Add baseline accessibility semantics and focus behavior in `src/app/shell/shell.component.html`, `src/app/shell/components/sidebar/sidebar.component.html`, `src/app/shell/components/toolbar/toolbar.component.html`, `src/app/shell/components/tab-bar/tab-bar.component.html`, `src/app/shell/components/bottom-panel/bottom-panel.component.html`, and `src/app/shell/components/status-bar/status-bar.component.html`
- [x] T022 [US1] Wire platform-aware shell root behavior and `shell.ready` emission in `src/app/shell/shell.component.ts`, `src/app/core/services/platform.service.ts`, and `src/app/core/state/session/`
- [x] T023 [US1] Validate User Story 1 MVP path by updating `scripts/electron-smoke.mjs`, `README.md`, and `specs/001-remediate-shell-v1/checklists/requirements.md`

**Checkpoint**: User Story 1 is independently functional, satisfying `FR-AppShell`, `FR-ShellComponents`, `FR-Layout`, and the structural part of `FR-Accessibility`. ✅ Complete.

**Gate G2**: Structural shell renders as the real root and preserves layout integrity and baseline keyboard access. ✅ **Passed.**

---

## Phase 3: User Story 2 - Restore a Safe Workspace Session (Priority: P2) [TS-09, TS-04, TS-07]

**Goal**: Persist and restore supported workspace layout and serializable tab state safely through validated preferences and IPC flows.

**Independent Test**: Modify layout and serializable tab state, restart the app, and verify valid state restores while corrupt or incompatible state falls back safely.

### Tests for User Story 2

- [x] T024 [P] [US2] Add repository and workspace identity tests in `src/app/core/infrastructure/persistence/local-storage/preferences.repository.spec.ts`, `src/app/core/services/user-preferences.service.spec.ts`, and `src/app/core/utils/workspace-id.util.spec.ts`
- [x] T025 [P] [US2] Add IPC and restoration integration tests in `src/app/core/infrastructure/electron/adapters/preferences.adapter.spec.ts`, `src/app/core/state/preferences/preferences.effects.spec.ts`, and `src/app/shell/shell.persistence.spec.ts`

### Implementation for User Story 2

- [x] T026 [US2] Implement workspace identity generation and fallback behavior in `src/app/core/utils/workspace-id.util.ts`, `src/app/core/services/user-preferences.service.ts`, and `src/app/core/models/preferences.model.ts`
- [x] T027 [US2] Create layout, preferences, session, and ui-context state slices in `src/app/core/state/layout/layout.actions.ts`, `src/app/core/state/layout/layout.reducer.ts`, `src/app/core/state/layout/layout.selectors.ts`, `src/app/core/state/preferences/preferences.actions.ts`, `src/app/core/state/preferences/preferences.reducer.ts`, `src/app/core/state/preferences/preferences.effects.ts`, `src/app/core/state/preferences/preferences.selectors.ts`, `src/app/core/state/session/session.actions.ts`, `src/app/core/state/session/session.reducer.ts`, `src/app/core/state/session/session.selectors.ts`, `src/app/core/state/ui-context/ui-context.actions.ts`, `src/app/core/state/ui-context/ui-context.reducer.ts`, and `src/app/core/state/ui-context/ui-context.selectors.ts`
- [x] T028 [US2] Implement validated preference IPC handling in `src/electron/ipc/handlers/preferences.handlers.ts`, `src/electron/main.ts`, and `src/electron/preload.ts`
- [x] T029 [US2] Implement preference adapters and envelope validation in `src/app/core/infrastructure/electron/adapters/preferences.adapter.ts`, `src/app/core/infrastructure/persistence/local-storage/preferences.repository.ts`, and `src/app/core/services/user-preferences.service.ts`
- [x] T030 [US2] Implement workspace session orchestration in `src/app/core/services/workspace-session.service.ts`, `src/app/core/models/workspace-session.model.ts`, and `src/app/core/models/dock-zone-assignment.model.ts`
- [x] T031 [US2] Wire sidebar, bottom panel, and secondary zone restoration in `src/app/shell/shell.component.ts`, `src/app/shell/components/sidebar/sidebar.component.ts`, and `src/app/shell/components/bottom-panel/bottom-panel.component.ts`

**Checkpoint**: User Story 2 is independently functional, satisfying `FR-Preferences`, `FR-Platform` persistence boundaries, `FR-Security` preference bridge requirements, and the workspace recovery scenarios. ✅ Complete.

**Gate G3**: Tabs, docking, commands, and persistence behave within the closed MVP scope. ✅ **Passed.**

---

## Phase 4: Complete Shell Implementation, Testing, and Closure [TS-05, TS-06, TS-07, TS-08, TS-11, TS-12, TS-13, TS-14, TS-15]

**Goal**: Deliver tabs, docking, commands, event tracing, security/performance validation, and quality closure through one consistent architecture. Prove the shell meets all DoD, success criteria, and requirement coverage before handoff.

**Independent Test**: Trigger commands from multiple entry points, manipulate tabs and docking within MVP scope, verify event traceability and secure bridge behavior, run startup smoke and performance validation, and confirm 80%+ automated coverage.

### Tests and Validation for Phase 4

- [x] T032 [P] [US3] Add event bus and command registry unit tests in `src/app/core/services/event-bus.service.spec.ts` and `src/app/core/services/command-registry.service.spec.ts`
- [x] T033 [P] [US3] Add tab, docking, and guard integration tests in `src/app/core/state/workspace/workspace.reducer.spec.ts`, `src/app/shell/components/tab-bar/tab-bar.component.spec.ts`, and `src/app/shell/docking.integration.spec.ts`
- [x] T034 [P] [US3] Add Electron security and startup smoke assertions in `scripts/electron-smoke.mjs`, `src/electron/main.spec.ts`, and `src/electron/preload.spec.ts`
- [x] T042 [P] Configure coverage thresholds and CI-visible validation in `package.json`, `karma.conf.js`, and `README.md`
- [x] T043 [P] Raise core service and state coverage to target in `src/app/core/services/*.spec.ts`, `src/app/core/state/**/*.spec.ts`, and `src/app/shell/**/*.spec.ts`
- [x] T044 [P] Finalize accessibility and keyboard regression checks in `src/app/shell/**/*.spec.ts`, `scripts/electron-smoke.mjs`, and `README.md`
- [x] T045 [P] Finalize startup and performance validation scripts in `scripts/electron-smoke.mjs`, `scripts/measure-shell-performance.mjs`, and `package.json`

### Implementation for Phase 4 (User Story 3)

- [x] T035 [US3] Implement workspace tabs state and models in `src/app/core/state/workspace/workspace.actions.ts`, `src/app/core/state/workspace/workspace.reducer.ts`, `src/app/core/state/workspace/workspace.selectors.ts`, `src/app/shell/models/tab-item.model.ts`, and `src/app/core/models/tab-descriptor.model.ts`
- [x] T036 [US3] Implement guarded TabBar interactions in `src/app/shell/components/tab-bar/tab-bar.component.ts`, `src/app/shell/components/tab-bar/tab-bar.component.html`, and `src/app/shell/components/tab-bar/tab-bar.component.css`
- [x] T037 [US3] Implement MVP docking zones and right-side panel behavior in `src/app/shell/shell.component.ts`, `src/app/shell/shell.component.html`, `src/app/shell/components/content-area/content-area.component.ts`, and `src/app/core/models/dock-zone-assignment.model.ts`
- [x] T038 [US3] Implement centralized command surface and shortcut normalization in `src/app/core/services/command-registry.service.ts`, `src/app/core/models/command-registration.model.ts`, `src/app/core/services/shell-shortcuts.service.ts`, and `src/app/shell/components/toolbar/toolbar.component.ts`
- [x] T039 [US3] Integrate typed event publication and dev tracing across shell interactions in `src/app/core/services/event-bus.service.ts`, `src/app/core/models/app-event.model.ts`, `src/app/shell/shell.component.ts`, `src/app/shell/components/sidebar/sidebar.component.ts`, `src/app/shell/components/tab-bar/tab-bar.component.ts`, and `src/app/shell/components/bottom-panel/bottom-panel.component.ts`
- [x] T040 [US3] Enforce strict security validation and URL allowlist behavior in `src/electron/main.ts`, `src/electron/preload.ts`, `src/electron/ipc/channels.ts`, and `src/electron/ipc/handlers/preferences.handlers.ts`
- [x] T041 [US3] Apply performance instrumentation and interaction-path optimizations in `src/app/shell/shell.component.ts`, `src/app/shell/components/sidebar/sidebar.component.ts`, `src/app/shell/components/tab-bar/tab-bar.component.ts`, and `scripts/measure-shell-performance.mjs`

### Closure for Phase 4

- [x] T046 Close requirement traceability and update delivery docs in `specs/001-remediate-shell-v1/spec.md`, `specs/001-remediate-shell-v1/plan.md`, `specs/001-remediate-shell-v1/tasks.md`, and `README.md`

**Checkpoint**: User Story 3 is fully functional and all quality criteria are validated. `DoD-01` through `DoD-06` and `SC-001` through `SC-006` are fully backed by executable work and validation. ✅ Complete.

**Gate G4**: Tabs, docking, commands, event tracing, security, reliability, and testing are all complete. The feature is ready for implementation handoff and release. ✅ **Passed.**

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 0**: Starts immediately. Must pass Gate G0 before Phase 1 begins.
- **Phase 1**: Depends on Phase 0 passing Gate G0. Must pass Gate G1 before Phase 2 begins.
- **Phase 2 / US1**: Depends on Phase 1 passing Gate G1 and defines the MVP critical path. Must pass Gate G2 before Phase 3 begins.
- **Phase 3 / US2**: Depends on Phase 2 passing Gate G2 and can begin after the US1 root shell is stable, but should not block the US1 MVP checkpoint. Must pass Gate G3 before Phase 4 begins.
- **Phase 4 / US3 + Quality Closure**: Depends on Phases 2 and 3, and on the persistence semantics established in Phase 3. Must pass Gate G4 to complete Shell v1 remediation.

### User Story Dependencies

- **US1 (Phase 2)**: No dependency on later stories. This is the MVP path. Requires Phase 0 and Phase 1 to complete.
- **US2 (Phase 3)**: Depends on foundational bridge/state work (Phase 0-1) and on structural shell regions from US1 (Phase 2).
- **US3 (Phase 4)**: Depends on foundational work (Phase 0-1), on the mounted AppShell from US1 (Phase 2), and on the persistence contracts from US2 (Phase 3).

### Parallel Opportunities

- T012 and T013 can run in parallel after Phase 1 completes.
- T016 through T019 can run in parallel after T015 completes.
- T024 and T025 can run in parallel after Phase 2 (US1) checkpoint.
- T032, T033, and T034 can run in parallel with T035-T041 after Phase 3 (US2) checkpoint.
- T043, T044, and T045 can run in parallel with T035-T041 in Phase 4.

---

## Coverage Matrix

| Requirement | Task Coverage |
|-------------|---------------|
| FR-Governance | T001, T046 |
| FR-AppShell | T002, T008, T012, T013, T014, T015, T023 |
| FR-ShellComponents | T015, T016, T017, T018, T019, T023 |
| FR-Layout | T015, T020, T031 |
| FR-Tabs | T033, T035, T036 |
| FR-Docking | T030, T031, T033, T037 |
| FR-Commands | T011, T032, T038 |
| FR-EventBus | T010, T032, T039 |
| FR-Preferences | T008, T009, T024, T025, T026, T027, T028, T029, T030, T031 |
| FR-Platform | T007, T022 |
| FR-Accessibility | T021, T044 |
| FR-Security | T004, T005, T006, T028, T034, T040 |
| FR-Testing | T003, T012, T013, T024, T025, T032, T033, T034, T042, T043, T044, T045 |
| NFR-Perf-01 | T041, T045 |
| NFR-Perf-02 | T036, T041, T045 |
| NFR-Perf-03 | T020, T037, T041, T045 |
| NFR-Perf-04 | T013, T034, T045 |
| NFR-Reliability-01 | T005, T006, T013, T028, T034, T045 |
| NFR-Security-01 | T006, T034, T040 |
| NFR-Security-02 | T006, T034, T040 |
| NFR-Quality-01 | T042, T043 |

## Implementation Strategy

### MVP First

1. Complete Phase 0.
2. Complete Phase 1.
3. Complete Phase 2 (User Story 1).
4. Run the startup smoke path and structural shell regression tests.
5. Stop and validate before moving to Phase 3 (User Story 2) and beyond.

### Incremental Delivery

1. Deliver governance, runtime baseline, and foundational contracts through Phases 0-1 (Gate G1).
2. Deliver the real AppShell and baseline shell chrome through Phase 2 / User Story 1 (Gate G2).
3. Add safe workspace restoration through Phase 3 / User Story 2 (Gate G3).
4. Add tabs, docking, commands, traceability, performance/security closure, and quality assurance through Phase 4 / User Story 3 (Gate G4).

### Stop-Ship Conditions

- Any direct Electron call from presentation code.
- Any preload capability without a validated main-process handler.
- Any reintroduction of Angular starter content at the root.
- Any docking behavior outside the three approved MVP zones.
- Any task change that leaves an FR or NFR unmapped.
- Any core service or global state code without corresponding automated test coverage at or above the 80% threshold.
