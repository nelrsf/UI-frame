# Tasks: CSS Grid Dockzone Resize

**Input**: Design documents from `/specs/014-css-grid-dockzone-resize/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [ ] T001 Verify Angular project structure and NgRx state management setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Create drag operation utility class in `src/app/shell/services/splitter-drag-operation.ts`
- [ ] T003 [P] Add zone resize actions in `src/app/core/state/layout/layout.actions.ts`
- [ ] T004 [P] Extend layout state interface and initial state in `src/app/core/state/layout/layout.reducer.ts`
- [ ] T005 Add zone resize reducers in `src/app/core/state/layout/layout.reducer.ts`
- [ ] T006 [P] Add layout selectors for internal zone dimensions in `src/app/core/state/layout/layout.selectors.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Resize Internal Dockzones via Splitters (Priority: P1) 🎯 MVP

**Goal**: Enable users to resize internal dockzones within the bottom panel and primary workspaces by dragging vertical/horizontal splitters using CSS grid methods (`grid-template-columns`, `grid-template-rows`).

**Independent Test**: Can be fully tested by dragging internal splitters in the bottom panel and primary workspaces and verifying that the internal zones resize correctly using CSS grid.

### Tests for User Story 1

- [ ] T007 [P] [US1] Unit test for layout state transitions and zone resize actions in `src/app/core/state/layout/layout.reducer.spec.ts`
- [ ] T008 [P] [US1] Unit test for drag operation class in `src/app/shell/services/splitter-drag-operation.spec.ts`
- [ ] T009 [US1] Integration test for drag interactions and resize operations in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.spec.ts`

### Implementation for User Story 1

- [ ] T010 [US1] Extend `ShellSplitterDragService` to add methods for internal zone dragging in `src/app/shell/services/splitter-drag.service.ts`
- [ ] T011 [US1] Update `LayoutSplittablePanelComponent` state to add draft dimensions for internal zones in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts`
- [ ] T012 [US1] Add splitter handle subscriptions in `LayoutSplittablePanelComponent` to subscribe to splitter handle events for internal zones in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts`
- [ ] T013 [US1] Update `layout-splittable-panel.component.html` template with internal zone pointer events in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.html`
- [ ] T014 [US1] Implement CSS grid binding and styling for internal zone resize in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.css`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Maintain Existing Splitter Functionality (Priority: P2)

**Goal**: Ensure the existing splitter functionality for the bottom panel and secondary panel continues to work as expected without regression.

**Independent Test**: Can be tested by verifying that existing splitters in the bottom panel and secondary panel continue to function correctly.

### Tests for User Story 2

- [ ] T015 [US2] Integration test for existing bottom panel and secondary panel splitters functionality in relevant test files

### Implementation for User Story 2

- [ ] T016 [US2] Verify existing splitter functionality in `src/app/shell/services/splitter-drag.service.ts` is maintained
- [ ] T017 [US2] Validate CSS custom properties for bottom panel and secondary panel remain functional in `src/app/shell/components/shell/shell.component.css`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T018 [P] Documentation updates in `specs/014-css-grid-dockzone-resize/`
- [ ] T019 Code cleanup and refactoring
- [ ] T020 Performance optimization: Verify >30 FPS during rapid drag operations
- [ ] T021 Validate minimum size constraints (100px minimum, 1000px maximum) are enforced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Should not regress US1 functionality

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before components/templates
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
