# Tasks: Tab Close and Add

**Input**: Design documents from `specs/009-tab-close-and-add/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Extend shellContent NgRx state to support TabCloseGuard storage. These tasks MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Extend `ShellTab` interface with optional `guard?: TabCloseGuard` in `src/app/core/state/shell-content/shell-content.reducer.ts`
- [x] T002 [P] Add optional `guard` parameter to `addShellTab` action in `src/app/core/state/shell-content/shell-content.actions.ts`
- [x] T003 Update reducer to store `guard` alongside `tabItem` and `componentType` in `src/app/core/state/shell-content/shell-content.reducer.ts` (depends on T001, T002)
- [x] T004 [P] Add `selectShellCloseGuards` selector returning `Record<string, TabCloseGuard>` in `src/app/core/state/shell-content/shell-content.selectors.ts`
- [x] T005 [P] Add optional `guard` parameter to `ShellManager.addTab()` method in `src/app/shell/shell-manager.service.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 2: User Story 1 — Close a Tab with Existing Guard (Priority: P1) 🎯 MVP

**Goal**: Wire the existing tab close logic in `TabBarComponent` to the NgRx workspace store so clicking the close (x) button actually removes tabs. The `TabCloseGuard.beforeClose()` mechanism is consulted for dirty tabs.

**Independent Test**: Register a tab with `closable: true`, mark it dirty, register a `TabCloseGuard` with `beforeClose()` that returns `false`, click the close button, and verify the tab remains open. Then test with a guard that returns `true` and verify the tab closes.

### Implementation for User Story 1

- [x] T006 [US1] Add `closeGuards$` observable using `selectShellCloseGuards` selector in `src/app/shell/shell.component.ts`
- [x] T007 [US1] Add `onShellTabClosed(tabId: string)` handler that dispatches `closeTab({ tabId, groupId: 'main' })` in `src/app/shell/shell.component.ts`
- [x] T008 [US1] Bind `[closeGuards]="closeGuards$ | async"` and `(tabClosed)="onShellTabClosed($event)"` to `<app-tab-bar>` in `src/app/shell/shell.component.html`
- [x] T009 [US1] Import `TabCloseGuard` and `selectShellCloseGuards` in `src/app/shell/shell.component.ts`
- [x] T010 [US1] Import `closeTab` action and `TabBarComponent` types as needed in `src/app/shell/shell.component.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional — tabs can be closed with guard support

---

## Phase 3: User Story 2 — Add a New Tab via Modal Picker (Priority: P2)

**Goal**: Implement a modal dialog triggered by the "+" button that lists all registered but unopened tabs with their icons and labels. Selecting a tab opens it in the workspace.

**Independent Test**: Click the "+" button, verify a modal appears with a list of registered tabs showing icons and labels, select a tab, and verify it opens in the workspace.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create `TabAddModalComponent` standalone component in `src/app/shell/components/tab-add-modal/tab-add-modal.component.ts` with `@Input() availableTabs: TabItem[]`, `@Output() tabSelected`, `@Output() dismissed`, and `@HostListener('keydown.escape')` handler
- [x] T012 [P] [US2] Create modal template with backdrop, tab list, and empty state in `src/app/shell/components/tab-add-modal/tab-add-modal.component.html`
- [x] T013 [P] [US2] Create modal styles using BEM naming and CSS custom properties in `src/app/shell/components/tab-add-modal/tab-add-modal.component.css`
- [x] T014 [US2] Add `TabAddModalComponent` to `imports` array in `src/app/shell/shell.component.ts`
- [x] T015 [US2] Add `showTabAddModal` boolean flag and `onNewTabRequested()`, `onTabAddModalSelected(tabId)`, `onTabAddModalDismissed()` handlers in `src/app/shell/shell.component.ts`
- [x] T016 [US2] Add `availableTabsForModal$` derived observable (registered tabs minus open tab IDs) in `src/app/shell/shell.component.ts`
- [x] T017 [US2] Bind `(newTabRequested)="onNewTabRequested()"` to `<app-tab-bar>` in `src/app/shell/shell.component.html`
- [x] T018 [US2] Add conditional `@if (showTabAddModal)` rendering of `<app-tab-add-modal>` with inputs/outputs in `src/app/shell/shell.component.html`
- [x] T019 [US2] Import `openTab` action and `selectTabsForGroup('main')` selector in `src/app/shell/shell.component.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: Tests

**Purpose**: Unit tests for the new modal component and updated close/add flows.

- [x] T020 [P] Create unit tests for `TabAddModalComponent` (tab selection, dismissal via escape, dismissal via backdrop, empty state) in `src/app/shell/components/tab-add-modal/tab-add-modal.component.spec.ts`
- [x] T021 [P] Update `TabBarComponent` tests to cover close flow with guards and newTabRequested emission in `src/app/shell/components/tab-bar/tab-bar.component.spec.ts`
- [x] T022 [P] Update `ShellComponent` tests to cover `onShellTabClosed`, `onNewTabRequested`, `onTabAddModalSelected`, and `onTabAddModalDismissed` handlers in `src/app/shell/shell.component.spec.ts`
- [x] T023 [P] Update `shellContentReducer` tests to cover `addShellTab` with optional guard in `src/app/core/state/shell-content/shell-content.reducer.spec.ts`
- [x] T024 [P] Add tests for `selectShellCloseGuards` selector in `src/app/core/state/shell-content/shell-content.selectors.spec.ts`
- [x] T025 [P] Update `ShellManager` tests to cover `addTab` with optional guard parameter in `src/app/shell/shell-manager.service.spec.ts`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T026 Run `npm test` and verify all tests pass
- [x] T027 Run `npm run build` and verify no compilation errors
- [x] T028 Manual validation per quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 2)**: Depends on Foundational phase completion
- **User Story 2 (Phase 3)**: Depends on Foundational phase completion. Independent of US1.
- **Tests (Phase 4)**: Depends on all implementation tasks being complete
- **Polish (Phase 5)**: Depends on all desired user stories and tests being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 1) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 1) — No dependencies on US1, but both stories modify `shell.component.ts` and `shell.component.html` (coordinate edits)

### Within Each User Story

- Models/state changes before component wiring
- Component logic before template bindings
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] (T001, T002, T004, T005) can run in parallel; T003 depends on T001 + T002
- All US2 modal component files (T011, T012, T013) can run in parallel
- All test tasks (T020–T026) can run in parallel once implementation is complete

---

## Parallel Example: Foundational Phase

```bash
# Launch all parallel foundational tasks together:
Task T001: Extend ShellTab interface with guard field
Task T002: Add guard parameter to addShellTab action
Task T004: Add selectShellCloseGuards selector
Task T005: Add guard parameter to ShellManager.addTab()

# Then run T003 (depends on T001 + T002):
Task T003: Update reducer to store guard
```

## Parallel Example: User Story 2

```bash
# Launch all modal component files together:
Task T011: Create TabAddModalComponent TypeScript
Task T012: Create TabAddModalComponent template
Task T013: Create TabAddModalComponent styles

# Then wire into ShellComponent:
Task T014-T019: ShellComponent integration tasks
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (CRITICAL — blocks all stories)
2. Complete Phase 2: User Story 1
3. **STOP and VALIDATE**: Test tab close with guard independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Tests → Verify all pass
5. Polish → Build and manual validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (close wiring)
   - Developer B: User Story 2 (modal component)
3. Both stories complete and integrate into ShellComponent

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `shell.component.ts` and `shell.component.html` are modified by both US1 and US2 — coordinate edits to avoid conflicts
