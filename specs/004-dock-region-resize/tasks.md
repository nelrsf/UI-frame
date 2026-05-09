# Tasks: Dock Region Resize

**Input**: Design documents from /specs/004-dock-region-resize/
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

## Format: [ID] [P?] [Story] Description

- [P]: Can run in parallel (different files, no dependencies)
- [Story]: User story label (US1, US2, US3) for story-specific phases only
- Every task includes a concrete file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare resize feature scaffolding and traceability docs.

- [X] T001 Define regression baseline suite for SC-005 in specs/004-dock-region-resize/quickstart.md
- [X] T002 [P] Add resize event contract export consistency in specs/004-dock-region-resize/contracts/index.ts
- [X] T003 [P] Align implementation notes with commit-only resize flow in specs/004-dock-region-resize/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core event/state foundations required by all user stories.

**CRITICAL**: No user story can be completed until this phase is done.

- [X] T004 Add typed event name and payload for shell.region.resized.v1 in src/app/core/models/app-event.model.ts
- [X] T005 Add layout commit action coverage for bottom/secondary resize commits in src/app/core/state/layout/layout.actions.ts
- [X] T006 Enforce integer pixel normalization helper for layout dimensions in src/app/core/state/layout/layout.reducer.ts
- [X] T007 Apply per-region clamp invariants for committed bottom/secondary dimensions in src/app/core/state/layout/layout.reducer.ts
- [X] T008 [P] Add selectors for committed resize snapshot consumption in src/app/core/state/layout/layout.selectors.ts
- [X] T009 [P] Add reducer unit tests for integer normalization and per-region clamping in src/app/core/state/layout/layout.spec.ts
- [X] T010 Add EventBus isolation regression test for shell.region.resized.v1 listener failures in src/app/core/services/event-bus.service.spec.ts

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Redimensionar paneles internos (Priority: P1) MVP

**Goal**: Enable resize interactions on Bottom Panel and Secondary Panel internal boundaries and update workspace space coherently.

**Independent Test**: Drag bottom and secondary splitters and verify committed dimension changes, workspace reflow, and no effect from non-supported boundaries.

### Tests for User Story 1

- [X] T011 [P] [US1] Add shell integration test for bottom splitter drag commit in src/app/shell/shell.component.spec.ts
- [X] T012 [P] [US1] Add shell integration test for secondary splitter drag commit in src/app/shell/shell.component.spec.ts
- [X] T013 [US1] Add shell integration test that workspace layout reflows after bottom/secondary commits in src/app/shell/shell.component.spec.ts

### Implementation for User Story 1

- [X] T014 [US1] Add internal bottom and secondary splitter handles in src/app/shell/shell.component.html
- [X] T015 [US1] Implement local drag lifecycle state (start/draft/commit/cancel) in src/app/shell/shell.component.ts
- [X] T016 [US1] Commit bottom splitter resize to NgRx only on drag end in src/app/shell/shell.component.ts
- [X] T017 [US1] Commit secondary splitter resize to NgRx only on drag end in src/app/shell/shell.component.ts
- [X] T018 [US1] Wire committed dimension values to shell CSS variables for workspace reflow in src/app/shell/shell.component.html
- [X] T019 [US1] Add splitter hit-zone layout and drag affordance geometry in src/app/shell/shell.component.css

**Checkpoint**: User Story 1 is independently functional.

---

## Phase 4: User Story 2 - Feedback visual nativo de resize (Priority: P2)

**Goal**: Provide native resize cursor feedback only on allowed splitter boundaries.

**Independent Test**: Hover allowed splitters and verify correct cursor orientation; hover Sidebar, Activity Bar, Toolbar, Status Bar, and non-splitter zones and verify no resize cursor.

### Tests for User Story 2

- [X] T020 [P] [US2] Add shell UI test for ns-resize cursor on bottom splitter hover in src/app/shell/shell.component.spec.ts
- [X] T021 [P] [US2] Add shell UI test for ew-resize cursor on secondary splitter hover in src/app/shell/shell.component.spec.ts
- [X] T022 [US2] Add shell UI test asserting no resize cursor on forbidden regions in src/app/shell/shell.component.spec.ts
- [X] T037 [US2] Add shell performance-oriented test that validates resize cursor feedback appears within 100 ms on allowed splitters in src/app/shell/shell.component.spec.ts

### Implementation for User Story 2

- [X] T023 [US2] Apply orientation-specific cursor classes to splitter handles in src/app/shell/shell.component.html
- [X] T024 [US2] Implement cursor state styles for valid hover/drag states in src/app/shell/shell.component.css
- [X] T025 [US2] Ensure sidebar/activity/toolbar/status regions expose default cursor behavior in src/app/shell/shell.component.css

**Checkpoint**: User Story 2 is independently functional.

---

## Phase 5: User Story 3 - Integracion con estado y eventos del shell (Priority: P3)

**Goal**: Publish committed resize events through EventBus and keep state/event contracts documented and consistent.

**Independent Test**: Complete resize interactions and verify one EventBus emission per commit with typed integer-pixel payload and isolated listener failures.

### Tests for User Story 3

- [X] T026 [P] [US3] Add shell integration test for one shell.region.resized.v1 emission per bottom commit in src/app/shell/shell.component.spec.ts
- [X] T027 [P] [US3] Add shell integration test for one shell.region.resized.v1 emission per secondary commit in src/app/shell/shell.component.spec.ts
- [X] T028 [US3] Add shell integration test verifying payload integer pixels and regionId semantics in src/app/shell/shell.component.spec.ts
- [X] T038 [US3] Add smoke validation that internal resize logic does not interfere with external window-edge resize behavior in scripts/electron-smoke.mjs

### Implementation for User Story 3

- [X] T029 [US3] Emit shell.region.resized.v1 on bottom commit with typed payload in src/app/shell/shell.component.ts
- [X] T030 [US3] Emit shell.region.resized.v1 on secondary commit with typed payload in src/app/shell/shell.component.ts
- [X] T031 [US3] Document runtime event usage and payload fields for developers in src/app/core/models/app-event.model.ts
- [X] T032 [US3] Synchronize feature event contract notes for future consumers in specs/004-dock-region-resize/contracts/dock-region-resize.contract.md

**Checkpoint**: User Story 3 is independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, non-regression checks, and delivery hygiene.

- [X] T033 [P] Update quick validation steps with final command set in specs/004-dock-region-resize/quickstart.md
- [X] T034 Run targeted shell and layout tests defined in package.json using src/app/shell/shell.component.spec.ts and src/app/core/state/layout/layout.spec.ts
- [X] T035 Run smoke validation scenario maintained in scripts/electron-smoke.mjs
- [X] T036 [P] Update requirement-to-task traceability notes in specs/004-dock-region-resize/plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately.
- Foundational (Phase 2): depends on Setup completion; blocks all user stories.
- User stories (Phases 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of desired user stories.

### User Story Dependencies

- US1 (P1): starts after Foundational; delivers MVP resize behavior.
- US2 (P2): starts after US1 splitter handles exist; independent from US3 event emission internals.
- US3 (P3): starts after US1 commit logic exists; can progress in parallel with US2 once splitters are implemented.

### Within Each User Story

- Write tests first and confirm they fail for the targeted behavior.
- Implement interaction/state logic after failing tests are in place.
- Validate story independently before moving to next priority.

---

## Parallel Opportunities

- Phase 1: T002 and T003 can run in parallel.
- Phase 2: T008 and T009 can run in parallel after T004-T007.
- US1: T011 and T012 can run in parallel.
- US2: T020 and T021 can run in parallel.
- US3: T026 and T027 can run in parallel.
- US2: T037 can run after T020-T021 in parallel with T023-T025.
- US3: T038 can run in parallel with T029-T032 once event/interaction wiring exists.
- Polish: T033 and T036 can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Run US1 commit behavior tests together:
Task: "T011 [US1] bottom splitter drag commit test in src/app/shell/shell.component.spec.ts"
Task: "T012 [US1] secondary splitter drag commit test in src/app/shell/shell.component.spec.ts"

# Then implement interaction handlers in sequence:
Task: "T015 [US1] local drag lifecycle state in src/app/shell/shell.component.ts"
Task: "T016 [US1] bottom commit dispatch in src/app/shell/shell.component.ts"
Task: "T017 [US1] secondary commit dispatch in src/app/shell/shell.component.ts"
```

## Parallel Example: User Story 2

```bash
# Run cursor-orientation tests together:
Task: "T020 [US2] ns-resize hover test in src/app/shell/shell.component.spec.ts"
Task: "T021 [US2] ew-resize hover test in src/app/shell/shell.component.spec.ts"

# Implement style wiring afterward:
Task: "T023 [US2] cursor classes in src/app/shell/shell.component.html"
Task: "T024 [US2] cursor states in src/app/shell/shell.component.css"
```

## Parallel Example: User Story 3

```bash
# Run event emission tests together:
Task: "T026 [US3] bottom commit event emission test in src/app/shell/shell.component.spec.ts"
Task: "T027 [US3] secondary commit event emission test in src/app/shell/shell.component.spec.ts"

# Then implement event emission handlers:
Task: "T029 [US3] bottom commit event emission in src/app/shell/shell.component.ts"
Task: "T030 [US3] secondary commit event emission in src/app/shell/shell.component.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independent test before proceeding.
4. Demo internal dock resize behavior.

### Incremental Delivery

1. Deliver US1 (resizable dock boundaries with commit-only state update).
2. Deliver US2 (native cursor discoverability).
3. Deliver US3 (typed event publication and contracted payloads).
4. Complete Polish phase validation and traceability updates.

### Parallel Team Strategy

1. Developer A: Foundational NgRx/event model updates (T004-T008).
2. Developer B: Foundational tests and EventBus isolation checks (T009-T010).
3. Developer C: Shell interaction + story tests (T011 onward).

---

## Notes

- All tasks follow the required checklist format: checkbox, task ID, optional [P], optional [USx], and concrete file path.
- User-story phases are independently testable by design and align with spec priorities P1 -> P2 -> P3.
- Story labels are intentionally omitted in Setup, Foundational, and Polish phases per format rules.
