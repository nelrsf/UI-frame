# Tasks: Remove EventBus and Consolidate Reactive Architecture

**Input**: Design documents from `/specs/008-remove-eventbus/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Existing unit tests must be updated (not new tests — modify existing specs to remove EventBus assertions).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Create the new NgRx command telemetry slice. This MUST be complete before CommandRegistryService can be migrated (US2).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create `src/app/core/state/command-telemetry/command-telemetry.actions.ts` with `commandExecuted` action (payload: commandId, success, timestamp, context?)
- [x] T002 [P] Create `src/app/core/state/command-telemetry/command-telemetry.reducer.ts` with bounded history (maxHistory: 100, FIFO eviction)
- [x] T003 [P] Create `src/app/core/state/command-telemetry/command-telemetry.selectors.ts` with `selectRecentExecutions` and `selectLastExecution` selectors
- [x] T004 [P] Create `src/app/core/state/command-telemetry/index.ts` barrel export
- [x] T005 Register `commandTelemetry` reducer in `src/app/app.config.ts` via `provideState('commandTelemetry', commandTelemetryReducer)`
- [x] T006 Add `CommandTelemetryState` to `AppState` interface in `src/app/core/state/app.state.ts`
- [x] T007 Re-export command telemetry from `src/app/core/state/index.ts`

**Checkpoint**: Command telemetry NgRx slice is registered and selectable. No production code uses it yet.

---

## Phase 2: User Story 1 - Eliminate EventBusService and migrate shell/layout events to NgRx (Priority: P1) 🎯 MVP

**Goal**: Remove all `eventBus.emit()` calls from ShellComponent, SidebarComponent, BottomPanelComponent, and TabBarComponent. NgRx Actions and Angular Outputs already handle the same semantics.

**Independent Test**: Application behaves identically — sidebar toggle, panel toggle/resize, tab selection all work. EventBusService is no longer imported in these 4 components.

### Implementation for User Story 1

- [x] T008 [US1] Remove `EventBusService` import and `eventBus.emit('shell.ready.v1', ...)` from `src/app/shell/shell.component.ts` (shellReady action already dispatched)
- [x] T009 [US1] Remove all 4 `eventBus.emit('shell.layout.changed.v1', ...)` calls from `src/app/shell/shell.component.ts` (toggleSidebar, toggleBottomPanel, toggleSecondaryPanel actions already dispatched)
- [x] T010 [US1] Remove both `eventBus.emit('shell.region.resized.v1', ...)` calls from `src/app/shell/shell.component.ts` (setBottomPanelHeight, setSecondaryPanelWidth actions already dispatched)
- [x] T011 [US1] Remove `EventBusService` import and `eventBus.emit()` calls from `src/app/shell/components/sidebar/sidebar.component.ts` (collapsedChange Output + setActiveSidebarItem action already handle semantics)
- [x] T012 [US1] Remove `EventBusService` import and `eventBus.emit()` calls from `src/app/shell/components/bottom-panel/bottom-panel.component.ts` (visibilityChange Output + toggleBottomPanel action already handle semantics)
- [x] T013 [US1] Remove `EventBusService` import and `eventBus.emit('tabs.active.changed.v1', ...)` from `src/app/shell/components/tab-bar/tab-bar.component.ts` (tabSelected Output + setActiveShellTab action already handle semantics)
- [x] T014 [US1] Update `src/app/shell/shell.component.spec.ts` — remove EventBusService TestBed provider, remove emit spy assertions, verify NgRx Actions are dispatched instead
- [x] T015 [US1] Update `src/app/shell/components/sidebar/sidebar.component.spec.ts` — remove EventBusService TestBed provider and emit spy assertions
- [x] T016 [US1] Update `src/app/shell/components/bottom-panel/bottom-panel.component.spec.ts` — remove EventBusService TestBed provider and emit spy assertions
- [x] T017 [US1] Update `src/app/shell/components/tab-bar/tab-bar.component.spec.ts` — remove EventBusService TestBed provider and emit spy assertions

**Checkpoint**: All 4 components emit zero EventBus events. NgRx Actions and Angular Outputs carry the full semantics. Build compiles. Tests pass.

---

## Phase 3: User Story 2 - Migrate command execution telemetry to NgRx (Priority: P2)

**Goal**: Replace `command.executed.v1` EventBus telemetry with NgRx `commandExecuted` Action. CommandRegistryService dispatches the action; tests subscribe via `store.select()`.

**Independent Test**: Command execution telemetry is observable via `store.select(selectRecentExecutions)`. Tests verify commandId, success, timestamp, and context in telemetry records.

### Implementation for User Story 2

- [x] T018 [US2] Refactor `src/app/core/services/command-registry.service.ts` — remove `EventBusService` dependency, inject `Store`, dispatch `commandExecuted` action on every command execution (success or failure)
- [x] T019 [US2] Update `src/app/core/services/command-registry.service.spec.ts` — replace `eventBus.on('command.executed.v1').subscribe()` with `store.select(selectRecentExecutions)` in all 6 test cases
- [x] T020 [US2] Update `src/app/shell/shell-manager.service.spec.ts` — remove EventBusService mock, verify command telemetry via store selector if applicable

**Checkpoint**: CommandRegistryService no longer depends on EventBusService. All command telemetry tests pass via NgRx selectors.

---

## Phase 4: User Story 3 - Clean up EventBusService and associated dead code (Priority: P3)

**Goal**: Delete EventBusService, app-event.model.ts, and all remaining references. Verify build and tests pass with zero EventBus references.

**Independent Test**: `ng build` succeeds. `ng test` passes. `rg "EventBusService|event-bus|eventBus" src/` returns zero results.

### Implementation for User Story 3

- [x] T021 [US3] Delete `src/app/core/services/event-bus.service.ts`
- [x] T022 [US3] Delete `src/app/core/services/event-bus.service.spec.ts`
- [x] T023 [US3] Delete `src/app/core/models/app-event.model.ts` (verify DockRegionId is not imported from here — it's already in workspace session model)
- [x] T024 [US3] Remove any remaining `EventBusService` imports from `src/app/shell/shell-manager.service.spec.ts` (if still present after T020)
- [x] T025 [US3] Run `ng build` — verify zero compilation errors
- [x] T026 [US3] Run `ng test` — verify all tests pass
- [x] T027 [US3] Run `rg "EventBusService|event-bus|eventBus" src/` — verify zero results remain

**Checkpoint**: EventBusService is completely removed from the codebase. No dead code remains.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T028 [P] Manual smoke test: launch app, verify sidebar toggle, bottom panel toggle/resize, secondary panel toggle/resize, tab selection, and native menu commands all work correctly
- [x] T029 [P] Run `quickstart.md` validation steps from `specs/008-remove-eventbus/quickstart.md`
- [x] T030 Verify no new lint warnings introduced by the refactoring

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS Phase 3 (US2).
- **User Story 1 (Phase 2)**: Depends on Foundational phase only for EventBusService removal context (T021-T023). Can proceed independently — just removes emit calls.
- **User Story 2 (Phase 3)**: Depends on Foundational phase completion (T001-T007). CommandRegistryService needs the telemetry slice to exist.
- **User Story 3 (Phase 4)**: Depends on US1 (Phase 2) and US2 (Phase 3) completion. Pure deletion — nothing left to reference.
- **Polish (Phase 5)**: Depends on all previous phases complete.

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Foundational. No dependencies on US2 or US3.
- **US2 (P2)**: Depends on Foundational (Phase 1) — telemetry slice must exist.
- **US3 (P3)**: Depends on US1 + US2 complete — deletion is the final step.

### Within Each User Story

- Models/Actions before services
- Services before test updates
- Story complete before moving to next priority

### Parallel Opportunities

- T001-T004 (Foundational) can run in parallel (different files, no inter-dependencies)
- T008-T010 (US1 ShellComponent) can run in parallel (same file but different lines — better done sequentially for safety)
- T011, T012, T013 (US1 child components) can run in parallel (different files)
- T014-T017 (US1 test updates) can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch all child component emit removals together:
Task: "Remove EventBusService from sidebar.component.ts"
Task: "Remove EventBusService from bottom-panel.component.ts"
Task: "Remove EventBusService from tab-bar.component.ts"

# Then update all test files together:
Task: "Update shell.component.spec.ts"
Task: "Update sidebar.component.spec.ts"
Task: "Update bottom-panel.component.spec.ts"
Task: "Update tab-bar.component.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (telemetry slice created)
2. Complete Phase 2: User Story 1 (remove all component emits)
3. **STOP and VALIDATE**: Build compiles, tests pass, behavior unchanged
4. EventBusService still exists but is no longer used by components

### Incremental Delivery

1. Complete Foundational → Telemetry slice ready
2. Remove component emits (US1) → Build passes, tests pass
3. Migrate CommandRegistry (US2) → Telemetry via NgRx
4. Delete EventBusService (US3) → Zero references remain
5. Each step is independently verifiable

### Parallel Team Strategy

With multiple developers:
1. Complete Foundational together
2. Once Foundational is done:
   - Developer A: US1 (remove emits from components)
   - Developer B: US2 (migrate CommandRegistry telemetry) — depends on Foundational only
3. After US1 + US2 complete:
   - Either developer: US3 (delete EventBusService + cleanup)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
