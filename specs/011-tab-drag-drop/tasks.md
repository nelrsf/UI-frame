# Tasks: Tab Drag-and-Drop Across Regions

**Input**: Design documents from `/specs/011-tab-drag-drop/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/internal-contracts.md

**Tests**: Unit tests (Jasmine/Karma) and integration tests included per spec requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed — project already exists with Angular 19, NgRx 19, and existing shell architecture.

*(No tasks — skip to Phase 2)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. This includes data models, the central drag service, NgRx actions/reducers, and ShellManager remove methods.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [P] Create drag-drop data models (RegionInterface, DragPhase, DraggableTab, DragState, DropZoneRegistration) in `src/app/core/models/drag-drop.model.ts`
- [x] T002 [P] Add NgRx workspace actions (`moveTabToZone`, `removeTab`) in `src/app/core/state/workspace/workspace.actions.ts`
- [x] T003 [P] Add NgRx shell-content actions (`removeBottomPanelEntry`, `removeSecondaryPanelEntry`) in `src/app/core/state/shell-content/shell-content.actions.ts`
- [x] T004 Implement `moveTabToZone` and `removeTab` reducer handlers in `src/app/core/state/workspace/workspace.reducer.ts` (depends on T002)
- [x] T005 Implement `removeBottomPanelEntry` and `removeSecondaryPanelEntry` reducer handlers in `src/app/core/state/shell-content/shell-content.reducer.ts` (depends on T003)
- [x] T006 Create DragDropService with drop zone registration, interface registration, and drag lifecycle methods in `src/app/shell/services/drag-drop.service.ts` (depends on T001)
- [x] T007 Add `removeTab`, `removeBottomPanelEntry`, `removeSecondaryPanelEntry` methods to ShellManager in `src/app/shell/shell-manager.service.ts` (depends on T002, T003)
- [x] T008 Wire interface registration calls (`registerComponentInterface`) into `ShellManager.addTab()`, `addBottomPanelEntry()`, `addSecondaryPanelEntry()` in `src/app/shell/shell-manager.service.ts` (depends on T006)

**Checkpoint**: Foundation ready — models, service, actions, reducers, and ShellManager remove methods are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 - Drag Tab Between Compatible Regions (Priority: P1)

**Goal**: Enable users to drag a tab from the central region tab bar and drop it onto a compatible region (bottom panel, secondary panel). The system validates interface compatibility before allowing the drop. On successful cross-region drop, the tab is unregistered from the source and re-registered in the target.

**Independent Test**: Drag a tab that implements both `ICentralRegionTab` and `IBottomPanelEntry` from the central region to the bottom panel drop zone, release it, and verify the tab appears in the bottom panel and disappears from the central region. Also verify that dropping a tab that does NOT implement the target interface is rejected.

### Tests for User Story 1

- [ ] T009 [P] [US1] Unit test for DragDropService `startDrag()`, `onDragMove()`, `endDrag()` lifecycle in `src/app/shell/services/drag-drop.service.spec.ts`
- [ ] T010 [P] [US1] Unit test for `moveTabToZone` reducer handler in `src/app/core/state/workspace/workspace.reducer.spec.ts`
- [ ] T011 [P] [US1] Unit test for `removeTab` reducer handler in `src/app/core/state/workspace/workspace.reducer.spec.ts`
- [ ] T012 [P] [US1] Unit test for `removeBottomPanelEntry` reducer handler in `src/app/core/state/shell-content/shell-content.reducer.spec.ts`

### Implementation for User Story 1

- [x] T013 [US1] Register drop zones (bottom panel, secondary panel) with DragDropService in `src/app/shell/shell.component.ts` `ngAfterViewInit()` (depends on T006, T008)
- [x] T014 [US1] Add global `keydown` listener for Escape key to cancel drag in `src/app/shell/shell.component.ts` (depends on T006)
- [x] T015 [US1] Add `onTabPointerDown(event: PointerEvent, tab: TabItem)` method and inject DragDropService in `src/app/shell/components/tab-bar/tab-bar.component.ts` (depends on T006)
- [x] T016 [US1] Add `(pointerdown)="onTabPointerDown($event, tab)"` binding to tab elements in `src/app/shell/components/tab-bar/tab-bar.component.html` (depends on T015)
- [x] T017 [US1] Implement pointer capture and `pointermove`/`pointerup`/`pointercancel` handlers in `src/app/shell/services/drag-drop.service.ts` following splitter drag pattern (depends on T006, T013)
- [x] T018 [US1] Implement drop zone bounding box intersection detection in `src/app/shell/services/drag-drop.service.ts` `onDragMove()` (depends on T017)
- [x] T019 [US1] Implement interface compatibility validation (`canDropTo`) in `src/app/shell/services/drag-drop.service.ts` (depends on T006)
- [x] T020 [US1] Implement cross-region drop logic: unregister from source via ShellManager, re-register in target via ShellManager in `src/app/shell/services/drag-drop.service.ts` `endDrag()` (depends on T008, T019)
- [x] T021 [US1] Implement same-zone drop rejection (drop back on source zone = cancel) in `src/app/shell/services/drag-drop.service.ts` (depends on T020)
- [x] T022 [US1] Add `drag-ghost` placeholder element to `src/app/shell/shell.component.html` (hidden until US2) (depends on T013)

**Checkpoint**: User Story 1 should be fully functional — tabs can be dragged from central region to compatible zones, with interface validation and unregister/re-register lifecycle.

---

## Phase 4: User Story 2 - Visual Drag Feedback (Priority: P2)

**Goal**: Provide visual feedback during drag operations: a drag ghost following the cursor, drop zone highlighting for compatible regions, and rejection indicators for incompatible regions.

**Independent Test**: Start a drag operation on any tab and observe that a drag ghost follows the cursor, compatible drop zones highlight visually, and incompatible drop zones show a rejection indicator.

### Tests for User Story 2

- [ ] T023 [P] [US2] Unit test for DragGhostComponent rendering and state binding in `src/app/shell/components/drag-ghost/drag-ghost.component.spec.ts`
- [ ] T024 [P] [US2] Unit test for drop zone CSS class toggling (compatible/incompatible) in `src/app/shell/shell.component.spec.ts`

### Implementation for User Story 2

- [x] T025 [P] [US2] Create DragGhostComponent (standalone) with `position: fixed`, `pointer-events: none`, `z-index: 1000` in `src/app/shell/components/drag-ghost/drag-ghost.component.ts`
- [x] T026 [P] [US2] Create DragGhostComponent template showing tab label, icon, and compatibility indicator in `src/app/shell/components/drag-ghost/drag-ghost.component.html`
- [x] T027 [P] [US2] Create DragGhostComponent styles in `src/app/shell/components/drag-ghost/drag-ghost.component.css`
- [x] T028 [US2] Wire DragGhostComponent to DragDropService `activeDragState$` observable for position and content updates in `src/app/shell/components/drag-ghost/drag-ghost.component.ts` (depends on T025, T006)
- [x] T029 [US2] Add DragGhostComponent to `src/app/shell/shell.component.html` with `*ngIf` bound to drag state (depends on T022, T028)
- [x] T030 [US2] Add drop zone CSS classes (`drop-zone-compatible`, `drop-zone-incompatible`) to `src/app/shell/shell.component.css` (depends on T013)
- [x] T031 [US2] Implement drop zone visual highlighting: toggle CSS classes on drop zone elements based on `dropCompatible$` in `src/app/shell/services/drag-drop.service.ts` (depends on T019, T030)

**Checkpoint**: User Stories 1 AND 2 should both work — drag operations now include full visual feedback with ghost, zone highlighting, and compatibility indicators.

---

## Phase 5: User Story 3 - Drag Tab to Reorder Within Same Region (Priority: P3)

**Goal**: Enable users to reorder tabs within the same central region tab bar by dragging and dropping to a different position.

**Independent Test**: Drag a tab from position 2 to position 0 within the same tab bar and verify the tab order changes accordingly.

### Tests for User Story 3

- [ ] T032 [P] [US3] Unit test for same-region reorder drop detection logic in `src/app/shell/services/drag-drop.service.spec.ts`
- [ ] T033 [P] [US3] Unit test for `reorderTab` integration in `src/app/shell/components/tab-bar/tab-bar.component.spec.ts`

### Implementation for User Story 3

- [x] T034 [US3] Implement same-region reorder drop zone detection: calculate target index from pointer position relative to tab elements in `src/app/shell/services/drag-drop.service.ts` (depends on T018)
- [x] T035 [US3] Wire `tabReordered` EventEmitter to dispatch existing `reorderTab` NgRx action in `src/app/shell/components/tab-bar/tab-bar.component.ts` (depends on T015)
- [x] T036 [US3] Handle same-region reorder in `endDrag()`: if dropped within source tab bar at different position, emit `tabReordered` instead of cross-region move in `src/app/shell/services/drag-drop.service.ts` (depends on T020, T034, T035)
- [x] T037 [US3] Add visual reorder indicator (insertion line or tab shift animation) to `src/app/shell/components/tab-bar/tab-bar.component.css` (depends on T034)

**Checkpoint**: All user stories should now be independently functional — cross-region move, visual feedback, and same-region reorder all work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, integration tests, and validation.

- [x] T038 [P] Handle drop outside any valid drop zone: cancel drag and restore tab in `src/app/shell/services/drag-drop.service.ts` `endDrag()` (depends on T020)
- [x] T039 [P] Handle Escape key cancellation: clear drag state without changes in `src/app/shell/shell.component.ts` (depends on T014)
- [x] T040 [P] Handle pinned tab preservation during cross-region move: pass `pinned` flag through `moveTabToZone` in `src/app/shell/services/drag-drop.service.ts` (depends on T020)
- [ ] T041 Integration test: full cross-region drag from central to bottom panel with mock components in `tests/integration/drag-drop.integration.spec.ts` (depends on T009, T023, T032)
- [ ] T042 Integration test: rejected drop on incompatible zone with visual feedback in `tests/integration/drag-drop.integration.spec.ts` (depends on T041)
- [ ] T043 Integration test: same-region reorder with position verification in `tests/integration/drag-drop.integration.spec.ts` (depends on T041)
- [x] T044 [N/A] Update workspace selectors to expose `activeDropZone$` and `dropCompatible$` if needed in `src/app/core/state/workspace/workspace.selectors.ts` — Not needed; DragDropService exposes these directly
- [x] T045 Run quickstart.md validation: execute `ng build` to verify compilation passes
- [ ] T046 [P] Unit test for multi-interface tab drop validation (tab implementing both `IBottomPanelEntry` and `ICentralRegionTab`) in `src/app/shell/services/drag-drop.service.spec.ts`
- [ ] T047 [P] Performance validation: measure drag response time under 16ms frame delay using DevTools performance marks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — skipped (project exists)
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (drag state must exist for ghost)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (drag initiation must work)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (T001-T008)
        │
        ▼
    US1 - P1 (T009-T022)  ← Cross-region drag + interface validation
        │
        ├──────────────────┐
        ▼                  ▼
    US2 - P2 (T023-T031)  US3 - P3 (T032-T037)
    Visual feedback        Same-region reorder
```

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 2**: T001, T002, T003 can run in parallel (different files). T004 depends on T002. T005 depends on T003. T006 depends on T001. T007 depends on T002+T003. T008 depends on T006.
- **Phase 3**: T009, T010, T011, T012 can run in parallel (different test files). T013 and T014 can start in parallel once T006/T008 complete.
- **Phase 4**: T023, T024 can run in parallel. T025, T026, T027 can run in parallel (component files).
- **Phase 5**: T032, T033 can run in parallel.
- **Phase 6**: T038, T039, T040 can run in parallel. T041, T042, T043 are sequential (each builds on prior).

---

## Parallel Example: Foundational Phase

```bash
# Launch all independent foundational tasks together:
Task: "Create drag-drop data models in src/app/core/models/drag-drop.model.ts"          (T001)
Task: "Add NgRx workspace actions in src/app/core/state/workspace/workspace.actions.ts" (T002)
Task: "Add NgRx shell-content actions in src/app/core/state/shell-content/shell-content.actions.ts" (T003)

# Then in parallel:
Task: "Implement workspace reducer handlers" (T004, depends on T002)
Task: "Implement shell-content reducer handlers" (T005, depends on T003)
Task: "Create DragDropService" (T006, depends on T001)
```

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all US1 tests together:
Task: "Unit test for DragDropService lifecycle" (T009)
Task: "Unit test for moveTabToZone reducer" (T010)
Task: "Unit test for removeTab reducer" (T011)
Task: "Unit test for removeBottomPanelEntry reducer" (T012)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T008)
2. Complete Phase 3: User Story 1 (T009-T022)
3. **STOP and VALIDATE**: Drag a tab from central region to bottom panel, verify it moves. Drag an incompatible tab, verify rejection.
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Models, service, actions, reducers ready
2. Add User Story 1 → Cross-region drag works → Test independently → Demo
3. Add User Story 2 → Visual feedback with ghost and zone highlighting → Test independently → Demo
4. Add User Story 3 → Same-region reorder works → Test independently → Demo
5. Polish → Edge cases, integration tests, validation
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together (T001-T008)
2. Once Foundational is done:
   - Developer A: User Story 1 (T009-T022)
   - Developer B: Can start on US2 tests (T023-T024) and DragGhostComponent skeleton (T025-T027) while A finishes US1
3. After US1 completes:
   - Developer A: User Story 3 (T032-T037)
   - Developer B: Finish US2 visual feedback (T028-T031)
4. Both complete polish tasks (T038-T045) together

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- DragDropService uses `providedIn: 'root'` — no manual provider registration needed in `app.config.ts`
- Pointer event pattern follows existing splitter drag in `shell.component.ts` (lines 459-519)
- All identifiers, types, and comments MUST use English (Constitution Language Convention)
