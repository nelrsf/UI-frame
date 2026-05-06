# Tasks: Secondary Panel Mock Modules (Weather + Market)

**Input**: Design documents from /specs/003-secondary-panel-mocks/
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

## Format: [ID] [P?] [Story] Description

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: User story label (US1, US2, US3) for story-specific phases only
- Every task includes a concrete file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare secondary-panel mock module layout and fixtures.

- [X] T001 Create secondary-panel fixture dataset in src/app/shell/mock-ui/fixtures/mock-secondary-panel.fixtures.ts
- [X] T002 [P] Create weather mock component scaffold in src/app/shell/mock-ui/components/mock-secondary-panel/mock-secondary-weather.component.ts
- [X] T003 [P] Create market mock component scaffold in src/app/shell/mock-ui/components/mock-secondary-panel/mock-secondary-market.component.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement contracts, state, shell wiring, and shared automated tests that all stories depend on.

**CRITICAL**: No user story can be completed until this phase is done.

- [X] T004 Create secondary panel registration contract in src/app/shell/contracts/ISecondaryPanelEntry.ts
- [X] T005 Update shell contracts barrel export in src/app/shell/contracts/index.ts
- [X] T006 Create internal secondary entry model in src/app/shell/models/secondary-panel-entry.model.ts
- [X] T007 Update shell-content actions for secondary entries in src/app/core/state/shell-content/shell-content.actions.ts
- [X] T008 Update shell-content reducer state shape for secondary entries in src/app/core/state/shell-content/shell-content.reducer.ts
- [X] T009 Update shell-content selectors for secondary active entry and component in src/app/core/state/shell-content/shell-content.selectors.ts
- [X] T010 Extend shell manager API with addSecondaryPanelEntry in src/app/shell/shell-manager.service.ts
- [X] T011 Wire secondary entry observables and dispatch handlers in src/app/shell/shell.component.ts
- [X] T012 Bind secondary entry inputs and events in src/app/shell/shell.component.html
- [X] T013 Add foundational reducer unit tests for secondary state transitions in src/app/core/state/shell-content/shell-content.reducer.spec.ts
- [X] T014 Add foundational selector unit tests for active secondary component resolution in src/app/core/state/shell-content/shell-content.selectors.spec.ts
- [X] T015 Add foundational ShellManager unit tests for secondary registration in src/app/shell/shell-manager.service.spec.ts

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Visualizar mocks del secondary panel (Priority: P1) MVP

**Goal**: Display two selectable free-content entries (Weather and Market) with deterministic first-open selection.

**Independent Test**: Open secondary panel, confirm Weather and Market entries are visible, Weather is active on first open.

- [X] T016 [P] [US1] Implement weather mock view markup and component styles in src/app/shell/mock-ui/components/mock-secondary-panel/mock-secondary-weather.component.ts and src/app/shell/mock-ui/components/mock-secondary-panel/mock-secondary-weather.component.html
- [X] T017 [P] [US1] Implement market mock view markup and component styles in src/app/shell/mock-ui/components/mock-secondary-panel/mock-secondary-market.component.ts and src/app/shell/mock-ui/components/mock-secondary-panel/mock-secondary-market.component.html
- [X] T018 [US1] Register WEATHER and MARKET secondary entries in src/app/shell/mock-ui/mock-registrations.ts
- [X] T019 [US1] Register secondary entries during bootstrap in src/app/shell/mock-ui/mock-content.initializer.ts
- [X] T020 [US1] Implement first-open default to Weather in src/app/core/state/shell-content/shell-content.reducer.ts
- [X] T021 [US1] Add secondary-panel component tests for entry visibility and initial active selection in src/app/shell/components/secondary-panel/secondary-panel.component.spec.ts

**Checkpoint**: User Story 1 is independently functional.

---

## Phase 4: User Story 3 - Reajustar el shell al colapsar la region (Priority: P1)

**Goal**: Ensure collapse/expand redistributes space without visual gaps and keeps active-entry consistency.

**Independent Test**: With Weather or Market active, collapse/re-expand repeatedly and verify no persistent gaps/overlaps and valid active entry.

- [X] T022 [US3] Keep active secondary entry stable across visibility toggles in src/app/shell/shell.component.ts
- [X] T023 [US3] Enforce secondary panel grid width collapse/expand behavior in src/app/shell/shell.component.css
- [X] T024 [US3] Add shell layout tests for secondary panel collapse/expand behavior in src/app/shell/shell.component.spec.ts
- [X] T025 [US3] Add docking integration assertions for secondary panel layout continuity in src/app/shell/docking.integration.spec.ts

**Checkpoint**: User Story 3 is independently functional.

---

## Phase 5: User Story 2 - Cambiar contenido dinamico dentro de la region (Priority: P2)

**Goal**: Resolve active component dynamically and apply fallback/empty-state rules.

**Independent Test**: Switch Weather/Market repeatedly and verify single active view; invalidate active entry and confirm fallback or controlled empty state.

- [X] T026 [US2] Implement secondary tab selection output handling in src/app/shell/components/secondary-panel/secondary-panel.component.ts
- [X] T027 [US2] Render active secondary component and controlled empty state with ngComponentOutlet in src/app/shell/components/secondary-panel/secondary-panel.component.html
- [X] T028 [US2] Add active secondary component selector logic in src/app/core/state/shell-content/shell-content.selectors.ts
- [X] T029 [US2] Implement invalid-active-entry fallback to valid entry in src/app/core/state/shell-content/shell-content.reducer.ts
- [X] T030 [US2] Implement no-entry controlled-empty-state behavior in src/app/core/state/shell-content/shell-content.reducer.ts
- [X] T031 [US2] Add secondary-panel component tests for dynamic component switching and empty state in src/app/shell/components/secondary-panel/secondary-panel.component.spec.ts

**Checkpoint**: User Story 2 is independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final traceability updates and automated validation execution.

- [X] T032 [P] Update secondary-panel implementation notes in specs/003-secondary-panel-mocks/quickstart.md
- [X] T033 [P] Update requirement traceability notes in specs/003-secondary-panel-mocks/plan.md
- [X] T034 Add secondary panel smoke scenario coverage in scripts/electron-smoke.mjs
- [X] T035 Run targeted automated checks in terminal: npm run test:shell and npm test

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately.
- Foundational (Phase 2): depends on Setup completion; blocks all user stories.
- User stories (Phases 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of desired user stories.

### User Story Dependencies

- US1 (P1): starts after Foundational; establishes MVP behavior.
- US3 (P1): starts after US1 to validate collapse/expand with real secondary entries registered.
- US2 (P2): starts after US1 and can proceed in parallel with US3 when touching different files.

### Within Each User Story

- Mock component implementation before registrations.
- Registrations before default/fallback rules.
- Behavior implementation before story-specific tests.

---

## Parallel Opportunities

- T002 and T003 can run in parallel (different component files).
- T016 and T017 can run in parallel (different component/view files).
- T013 and T014 can run in parallel (different test files).
- T032 and T033 can run in parallel (different documentation files).

---

## Implementation Strategy

### MVP First (US1 + required foundation)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independent test before proceeding.

### Incremental Delivery

1. Deliver US1 (visual mocks and deterministic first-open behavior).
2. Deliver US3 (layout resilience on collapse/expand).
3. Deliver US2 (dynamic switching and fallback/empty-state hardening).
4. Finish with Phase 6 validation and smoke coverage.

### Team Parallel Strategy

1. One developer handles foundational state/manager wiring (T004-T012).
2. One developer handles foundational automated tests (T013-T015).
3. One developer handles mock views and registration (T016-T021).

---

## Notes

- Automated tests are explicitly included to satisfy constitution traceability and quality gates.
- T035 only executes test commands; manual app run remains documented in quickstart as a separate validation step.
- Gate closure evidence (2026-05-05): `npm run test:shell` -> TOTAL: 227 SUCCESS; `npm test -- --watch=false --browsers=ChromeHeadless` -> TOTAL: 696 SUCCESS.
