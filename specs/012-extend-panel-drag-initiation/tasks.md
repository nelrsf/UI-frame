---

description: "Task list for extending drag initiation to bottom and secondary panels"
---

# Tasks: Extend Panel Drag Initiation

**Input**: Design documents from `/specs/012-extend-panel-drag-initiation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/README.md

**Tests**: Unit and component tests included per research.md testing strategy.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/app/shell/` for shell components and services

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing drag-and-drop infrastructure and prepare for extension

- [x] T001 Verify `DragDropService` exists and is functional at `src/app/shell/services/drag-drop.service.ts`
- [x] T002 [P] Verify `DockZone` enum includes `BottomPanel` and `SecondaryPanel` values in `src/app/shell/services/drag-drop.service.ts` or related types file
- [x] T003 [P] Verify `RegionInterface` enum includes `BottomPanelEntry` and `SecondaryPanelEntry` values

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: NgRx actions and reducer handlers for panel reorder — required before any user story that involves same-region reorder

**⚠️ CRITICAL**: US3 and US4 cannot complete without these actions

- [x] T004 Add `reorderBottomPanelTabs` action to `src/app/shell/state/shell-content.actions.ts` with `{ fromIndex: number; toIndex: number }` payload
- [x] T005 [P] Add `reorderSecondaryPanelEntries` action to `src/app/shell/state/shell-content.actions.ts` with `{ fromIndex: number; toIndex: number }` payload
- [x] T006 Add reducer handler for `reorderBottomPanelTabs` in `src/app/shell/state/shell-content.reducer.ts` that reorders the bottom panel tabs array
- [x] T007 [P] Add reducer handler for `reorderSecondaryPanelEntries` in `src/app/shell/state/shell-content.reducer.ts` that reorders the secondary panel entries array

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Drag Tab from Bottom Panel to Central Region (Priority: P1) 🎯 MVP

**Goal**: Enable users to drag tabs from the bottom panel tab bar to the central region tab bar, with cross-region move on compatible drop and rejection with visual feedback on incompatible drop.

**Independent Test**: Can be fully tested by dragging a bottom panel tab to the central region tab bar and verifying the tab appears in the workspace after drop, or is rejected with visual feedback if incompatible. Normal clicks (select, close) must not trigger drag.

### Tests for User Story 1

- [ ] T008 [P] [US1] Unit test for `onTabPointerDown` handler in `src/app/shell/components/bottom-panel/bottom-panel.component.spec.ts` verifying `DraggableTab` construction with `sourceZone: DockZone.BottomPanel`
- [ ] T009 [P] [US1] Unit test for `onTabPointerDown` handler verifying `dragDropService.startDrag()` is called only when `event.button === 0`
- [ ] T010 [US1] Component test in `src/app/shell/components/bottom-panel/bottom-panel.component.spec.ts` verifying `(pointerdown)` binding on tab elements triggers `onTabPointerDown`

### Implementation for User Story 1

- [x] T011 [US1] Inject `DragDropService` into `BottomPanelComponent` constructor in `src/app/shell/components/bottom-panel/bottom-panel.component.ts`
- [x] T012 [US1] Implement `onTabPointerDown(event: PointerEvent, panel: PanelTab)` handler in `src/app/shell/components/bottom-panel/bottom-panel.component.ts` that constructs `DraggableTab` with `sourceZone: DockZone.BottomPanel`, `sourceGroupId: ''`, `pinned: false`, `dirty: false`, `implementedInterfaces` from `dragDropService.getComponentInterfaces(panel.component)`, and calls `dragDropService.startDrag(draggableTab, event)`
- [x] T013 [US1] Add `(pointerdown)="onTabPointerDown($event, panel)"` binding to tab elements in `src/app/shell/components/bottom-panel/bottom-panel.component.html`
- [x] T014 [US1] Add optional `[class.dragging]="dragDropService.isDragging()"` class binding to tab elements in `src/app/shell/components/bottom-panel/bottom-panel.component.html` for visual feedback

**Checkpoint**: At this point, User Story 1 should be fully functional — bottom panel tabs can be dragged to central region

---

## Phase 4: User Story 2 — Drag Tab from Secondary Panel to Compatible Region (Priority: P2)

**Goal**: Enable users to drag tabs from the secondary panel tab bar to compatible drop zones (central region or bottom panel), with cross-region move on compatible drop and rejection on incompatible drop.

**Independent Test**: Can be fully tested by dragging a secondary panel tab to a compatible drop zone and verifying the tab relocates correctly.

### Tests for User Story 2

- [ ] T015 [P] [US2] Unit test for `onEntryPointerDown` handler in `src/app/shell/components/secondary-panel/secondary-panel.component.spec.ts` verifying `DraggableTab` construction with `sourceZone: DockZone.SecondaryPanel`
- [ ] T016 [P] [US2] Unit test for `onEntryPointerDown` handler verifying `dragDropService.startDrag()` is called only when `event.button === 0`
- [ ] T017 [US2] Component test in `src/app/shell/components/secondary-panel/secondary-panel.component.spec.ts` verifying `(pointerdown)` binding on entry tab elements triggers `onEntryPointerDown`

### Implementation for User Story 2

- [x] T018 [US2] Inject `DragDropService` into `SecondaryPanelComponent` constructor in `src/app/shell/components/secondary-panel/secondary-panel.component.ts`
- [x] T019 [US2] Implement `onEntryPointerDown(event: PointerEvent, entry: SecondaryPanelEntry)` handler in `src/app/shell/components/secondary-panel/secondary-panel.component.ts` that constructs `DraggableTab` with `sourceZone: DockZone.SecondaryPanel`, `sourceGroupId: ''`, `pinned: false`, `dirty: false`, `implementedInterfaces` from `dragDropService.getComponentInterfaces(entry.component)`, and calls `dragDropService.startDrag(draggableTab, event)`
- [x] T020 [US2] Add `(pointerdown)="onEntryPointerDown($event, entry)"` binding to entry tab elements in `src/app/shell/components/secondary-panel/secondary-panel.component.html`
- [x] T021 [US2] Add optional `[class.dragging]="dragDropService.isDragging()"` class binding to entry tab elements in `src/app/shell/components/secondary-panel/secondary-panel.component.html` for visual feedback

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Reorder Tabs Within Bottom Panel (Priority: P3)

**Goal**: Enable users to reorder tabs within the bottom panel tab bar via drag-and-drop, with order persisting after drag completes.

**Independent Test**: Can be fully tested by dragging a bottom panel tab to a different position within the bottom panel and verifying the order changes.

### Tests for User Story 3

- [ ] T022 [P] [US3] Unit test in `src/app/shell/components/bottom-panel/bottom-panel.component.spec.ts` verifying `registerReorderSource()` callback dispatches `reorderBottomPanelTabs` action with correct `fromIndex` and `toIndex`

### Implementation for User Story 3

- [x] T023 [US3] Call `dragDropService.registerReorderSource()` in `BottomPanelComponent.ngAfterViewInit()` with a callback that dispatches `reorderBottomPanelTabs` action using the store, passing `fromIndex` and `toIndex` from the reorder callback parameters

**Checkpoint**: User Story 3 should be fully functional — bottom panel tabs can be reordered within the panel

---

## Phase 6: User Story 4 — Reorder Entries Within Secondary Panel (Priority: P3)

**Goal**: Enable users to reorder entries within the secondary panel tab bar via drag-and-drop, with order persisting after drag completes.

**Independent Test**: Can be fully tested by dragging a secondary panel entry to a different position and verifying the order changes.

### Tests for User Story 4

- [ ] T024 [P] [US4] Unit test in `src/app/shell/components/secondary-panel/secondary-panel.component.spec.ts` verifying `registerReorderSource()` callback dispatches `reorderSecondaryPanelEntries` action with correct `fromIndex` and `toIndex`

### Implementation for User Story 4

- [x] T025 [US4] Call `dragDropService.registerReorderSource()` in `SecondaryPanelComponent.ngAfterViewInit()` with a callback that dispatches `reorderSecondaryPanelEntries` action using the store, passing `fromIndex` and `toIndex` from the reorder callback parameters

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification, edge case handling, and documentation

- [x] T026 [P] Verify multi-interface component behavior: ensure `ShellManager` registers all applicable interfaces when adding bottom/secondary panel entries
- [x] T027 [P] Verify escape key cancellation works during drag from bottom/secondary panels (handled by existing `DragDropService`)
- [x] T028 [P] Verify drag outside drop zone cancellation works for bottom/secondary panels (handled by existing `DragDropService`)
- [x] T029 [P] Verify dragging the only tab from bottom panel leaves panel in valid empty state
- [x] T030 Run `quickstart.md` validation steps to verify end-to-end drag behavior across all panels
- [x] T031 Run existing test suite to ensure no regressions in central region drag behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS US3 and US4
- **User Stories (Phase 3+)**: All depend on Foundational phase completion for reorder actions
  - US1 (Phase 3) can proceed independently of US2, US3, US4
  - US2 (Phase 4) can proceed independently of US1, US3, US4
  - US3 (Phase 5) depends on Foundational (Phase 2) for `reorderBottomPanelTabs` action
  - US4 (Phase 6) depends on Foundational (Phase 2) for `reorderSecondaryPanelEntries` action
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1) — no dependencies on Foundational or other stories
- **User Story 2 (P2)**: Can start after Setup (Phase 1) — no dependencies on Foundational or other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — depends on `reorderBottomPanelTabs` action
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) — depends on `reorderSecondaryPanelEntries` action

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Component handler implementation before template binding
- Template binding before integration testing
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- US1 and US2 can proceed in parallel after Setup (they don't need Foundational)
- US3 and US4 can proceed in parallel after Foundational
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for onTabPointerDown handler (DraggableTab construction) in bottom-panel.component.spec.ts"
Task: "Unit test for onTabPointerDown handler (button check) in bottom-panel.component.spec.ts"
Task: "Component test for pointerdown binding in bottom-panel.component.spec.ts"

# Implementation sequence (cannot parallelize due to dependencies):
1. Inject DragDropService in constructor
2. Implement onTabPointerDown handler
3. Add pointerdown binding to template
4. Add dragging class binding to template
```

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Unit test for onEntryPointerDown handler (DraggableTab construction) in secondary-panel.component.spec.ts"
Task: "Unit test for onEntryPointerDown handler (button check) in secondary-panel.component.spec.ts"
Task: "Component test for pointerdown binding in secondary-panel.component.spec.ts"

# Implementation sequence:
1. Inject DragDropService in constructor
2. Implement onEntryPointerDown handler
3. Add pointerdown binding to template
4. Add dragging class binding to template
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 (does NOT need Foundational phase)
3. **STOP and VALIDATE**: Test bottom panel drag to central region independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup → Foundation verified
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Complete Foundational (Phase 2) → Reorder actions ready
5. Add User Story 3 → Test independently → Deploy/Demo
6. Add User Story 4 → Test independently → Deploy/Demo
7. Complete Polish → Full feature validation
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup together
2. Once Setup is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. Team completes Foundational together
4. Once Foundational is done:
   - Developer A: User Story 3
   - Developer B: User Story 4
5. Team completes Polish together
6. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Circular DI warning**: Do NOT inject `DragDropService` directly in `ShellManager` constructor — use `Injector.get(DragDropService)` pattern (already in place)
- **Drag threshold**: 4px movement required before drag activates — normal clicks must not trigger drag
- **DragGhostComponent**: Already rendered outside `.shell-root` to avoid `overflow: hidden` clipping — no changes needed
