# Tasks: Status Bar Mock Data

**Input**: Design documents from `/specs/010-status-bar-mocks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/status-bar-mock-config.md

**Tests**: Included — the feature specification implies quality gates (Constitution Principle V) requiring automated tests for the mock configuration loader, callback registry, and status bar component behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Angular + Electron desktop shell

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No dedicated setup tasks needed — the Angular/Electron project is already initialized with NgRx, CommandRegistry, and the existing StatusBarComponent.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create status-bar NgRx actions in `src/app/core/state/status-bar/status-bar.actions.ts` with actions: `loadStatusBarItems`, `setCallbackError`, `clearCallbackError`
- [x] T002 [P] Create status-bar NgRx reducer in `src/app/core/state/status-bar/status-bar.reducer.ts` with `StatusBarState` interface (leftItems, rightItems, loaded, error) and handlers for all actions
- [x] T003 [P] Create status-bar barrel export in `src/app/core/state/status-bar/index.ts`
- [x] T004 Create status-bar NgRx selectors in `src/app/core/state/status-bar/status-bar.selectors.ts` with `selectStatusBarLeftItems` and `selectStatusBarRightItems` (depends on T002 for state interface)
- [x] T005 Create mock config loader service in `src/app/core/infrastructure/mock-config/mock-config.loader.ts` that fetches `assets/config/status-bar-mocks.json`, parses items, splits by position, and dispatches `loadStatusBarItems`
- [x] T006 Create callback registry service in `src/app/core/services/callback-registry.service.ts` with `register()`, `execute()`, `has()`, `unregister()` methods; `execute()` wraps callbacks in try/catch and dispatches `setCallbackError` on failure
- [x] T007 Update `src/app/app.config.ts` to register `provideState('statusBar', statusBarReducer)` and add `APP_INITIALIZER` factory for `MockConfigLoader`
- [x] T008 Update `src/app/app.config.ts` to provide `CallbackRegistryService` in root injector (if not already providedIn: 'root')

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - View Mock Status Bar Items (Priority: P1) 🎯 MVP

**Goal**: Display mock status bar items loaded from JSON configuration with correct text and positioning (left/right sections)

**Independent Test**: Launch the application and observe that mock items from `status-bar-mocks.json` appear in the status bar in their designated left/right sections

### Tests for User Story 1

- [x] T009 [P] [US1] Unit test for MockConfigLoader in `src/app/core/infrastructure/mock-config/mock-config.loader.spec.ts` — test successful load, invalid JSON, and missing file scenarios
- [x] T010 [P] [US1] Unit test for callback registry in `src/app/core/services/callback-registry.service.spec.ts` — test register, execute, has, unregister, and error handling

### Implementation for User Story 1

- [x] T011 [P] [US1] Add `position: 'left' | 'right'` field to `StatusBarItem` interface in `src/app/shell/models/status-bar-item.model.ts`
- [x] T012 [US1] Wire `ShellComponent` to select status bar items from NgRx store and pass to `<app-status-bar>` via `[leftItems]` and `[rightItems]` bindings in `src/app/shell/shell.component.ts` and `src/app/shell/shell.component.html`
- [x] T013 [US1] Create sample mock configuration file at `src/assets/config/status-bar-mocks.json` with 3-5 items demonstrating left/right positioning, icons, tooltips, and color variants

**Checkpoint**: At this point, User Story 1 should be fully functional — mock items load from JSON and display in the status bar

---

## Phase 4: User Story 2 - Add Custom Status Bar Items via Quick Start (Priority: P2)

**Goal**: Provide quick start documentation so developers can add custom status bar items by editing the JSON configuration and registering callbacks

**Independent Test**: Follow the quickstart.md guide to add a new item to the JSON config and verify it appears in the status bar without code changes

### Implementation for User Story 2

- [x] T014 [US2] Update quickstart documentation at `specs/010-status-bar-mocks/quickstart.md` with step-by-step instructions, JSON schema reference, callback registration examples, and troubleshooting

**Checkpoint**: User Story 2 complete — developers can extend the status bar using documentation

---

## Phase 5: User Story 3 - Configure Clickable Status Bar Items (Priority: P3)

**Goal**: Enable clickable status bar items that execute developer-registered callbacks via commandId, with visual error feedback when callbacks fail

**Independent Test**: Click a configured clickable item and verify the associated callback executes; trigger a callback error and verify the item shows a red error indicator

### Tests for User Story 3

- [x] T015 [P] [US3] Add unit test in `src/app/core/services/callback-registry.service.spec.ts` for callback execution via commandId and error dispatch behavior
- [x] T016 [P] [US3] Add unit test in `src/app/shell/components/status-bar/status-bar.component.spec.ts` for clickable item dispatching command and error color display

### Implementation for User Story 3

- [x] T017 [P] [US3] Update `StatusBarComponent.onItemClick()` in `src/app/shell/components/status-bar/status-bar.component.ts` to dispatch `CommandRegistry.execute(item.commandId)` when a clickable item is clicked
- [x] T018 [P] [US3] Create NgRx Effect in `src/app/core/state/status-bar/status-bar.effects.ts` that listens for `setCallbackError`, sets item color to 'error', and dispatches `clearCallbackError` after 3 seconds
- [x] T019 [US3] Add reducer handler for `clearCallbackError` in `src/app/core/state/status-bar/status-bar.reducer.ts` to reset item color to 'default'
- [x] T020 [US3] Add selector `selectStatusBarErrorItems` in `src/app/core/state/status-bar/status-bar.selectors.ts` for items currently in error state

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T021 [P] Add duplicate ID detection and warning in `src/app/core/infrastructure/mock-config/mock-config.loader.ts` when parsing config
- [x] T022 Run quickstart.md validation by following the guide end-to-end and confirming all examples work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — no tasks needed
- **Foundational (Phase 2)**: No dependencies — can start immediately. **BLOCKS all user stories**
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after US1 — builds on the working mock system
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — depends on T006 (CallbackRegistry) but not on US1 or US2 completion

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before component integration
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Foundational phase**: T001, T002, T003 can run in parallel (different files, no dependencies); T005 and T006 can run in parallel
- **US1**: T009 and T010 can run in parallel; T011 can run in parallel with T009/T010
- **US3**: T015 and T016 can run in parallel; T017 and T018 can run in parallel

### Parallel Example: Foundational Phase

```bash
# Launch independent foundational tasks together:
Task: "Create status-bar NgRx actions in src/app/core/state/status-bar/status-bar.actions.ts"
Task: "Create status-bar NgRx reducer in src/app/core/state/status-bar/status-bar.reducer.ts"
Task: "Create status-bar barrel export in src/app/core/state/status-bar/index.ts"

# Then (after T002 complete):
Task: "Create status-bar NgRx selectors in src/app/core/state/status-bar/status-bar.selectors.ts"

# These can run in parallel with each other:
Task: "Create mock config loader in src/app/core/infrastructure/mock-config/mock-config.loader.ts"
Task: "Create callback registry service in src/app/core/services/callback-registry.service.ts"
```

### Parallel Example: User Story 1

```bash
# Launch tests and model update together:
Task: "Unit test for MockConfigLoader in src/app/core/infrastructure/mock-config/mock-config.loader.spec.ts"
Task: "Unit test for callback registry in src/app/core/services/callback-registry.service.spec.ts"
Task: "Add position field to StatusBarItem in src/app/shell/models/status-bar-item.model.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Launch app and confirm mock items display in status bar
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Mock items display from JSON → Test independently → Demo (MVP!)
3. Add User Story 2 → Quick start docs → Test by following guide → Demo
4. Add User Story 3 → Clickable items with callbacks → Test click and error handling → Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 3 (can start independently — depends only on CallbackRegistry)
3. User Story 2 after US1 is complete
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The existing `StatusBarComponent` already has `leftItems`/`rightItems` inputs and CSS for clickable/error/warning/success variants — leverage existing code
- The `CommandRegistryService` already exists with `register()` and `execute()` — the callback registry wraps this pattern for developer-defined callbacks
- NgRx state slice follows the same pattern as `session`, `layout`, `uiContext` (actions, reducer, selectors, index.ts barrel)
