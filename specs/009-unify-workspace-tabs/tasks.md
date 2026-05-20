# Tasks: Unify Workspace Tab Management

**Input**: Design documents from `/specs/009-unify-workspace-tabs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single project (Angular/Electron desktop app). All paths relative to repository root.

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Extend the TabItem model and add new workspace actions. These MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Extend `TabItem` interface with `componentType?: Type<unknown>` and `closeGuard?: TabCloseGuard` properties in `src/app/shell/models/tab-item.model.ts`
- [x] T002 Add `registerTab` action (props: `{ tab: TabItem }`) and `registerAndOpenTab` action (props: `{ tab: TabItem }`) in `src/app/core/state/workspace/workspace.actions.ts`
- [x] T003 Update workspace exports in `src/app/core/state/workspace/index.ts` to include new actions

**Checkpoint**: Foundation ready — TabItem model extended, new actions defined, user story implementation can now begin.

---

## Phase 2: User Story 1 — Tabs render and behave from a single source of truth (Priority: P1) 🎯 MVP

**Goal**: Tabs displayed in the tab bar can be closed properly because both display and management state come from the single workspace slice. The `registerTab` action adds tabs to workspace state, and `openTab` correctly activates already-registered tabs.

**Independent Test**: Open two tabs via the shell manager, then close one tab via the tab bar's close button. The tab must be removed from the display and the adjacent tab must become active.

### Implementation for User Story 1

- [x] T004 [US1] Add `registerTab` reducer handler in `src/app/core/state/workspace/workspace.reducer.ts` — creates new group if groupId doesn't exist, appends tab if group exists but tab not present, no-op if tab already in group; does NOT change activeTabId
- [x] T005 [US1] Modify `openTab` reducer handler in `src/app/core/state/workspace/workspace.reducer.ts` — if tab exists in group, activate it; if tab exists in state but not in group, add to group and activate; if tab not registered, no-op with console.warn
- [x] T006 [US1] Add `registerAndOpenTab` reducer handler in `src/app/core/state/workspace/workspace.reducer.ts` — applies registerTab logic then openTab logic sequentially within a single reducer call (no Effect needed)
- [x] T007 [US1] Add unit tests for `registerTab` action in `src/app/core/state/workspace/workspace.reducer.spec.ts` — test: creates new group, appends to existing group, no-op for duplicate tab
- [x] T008 [US1] Add unit tests for modified `openTab` action in `src/app/core/state/workspace/workspace.reducer.spec.ts` — test: activates existing tab, no-op for unregistered tab
- [x] T009 [US1] Add unit tests for `registerAndOpenTab` facade in `src/app/core/state/workspace/workspace.reducer.spec.ts` — test: registers and activates in one call, no duplicate on re-registration

**Checkpoint**: At this point, `registerTab`, `openTab`, and `registerAndOpenTab` all work correctly. Existing `closeTab`, `selectTab`, `reorderTab` tests still pass. Tabs can be registered and opened from workspace alone.

---

## Phase 3: User Story 2 — Tab registration opens and displays the tab immediately (Priority: P1)

**Goal**: `ShellManager.addTab()` dispatches `registerAndOpenTab` so that a single registration call both registers the tab in state and makes it visible and active in the UI.

**Independent Test**: Register a new tab via `ShellManager.addTab()` and verify it appears in the tab bar, is selected as active, and its component renders in the content area.

### Implementation for User Story 2

- [x] T010 [US2] Update `ShellManager.addTab()` in `src/app/shell/shell-manager.service.ts` to dispatch `registerAndOpenTab` instead of `addShellTab`; pass `componentType` from `ICentralRegionTab.component` as `tab.componentType`
- [x] T011 [US2] Update `ShellManager` imports in `src/app/shell/shell-manager.service.ts` — remove `addShellTab` from shellContent import, add `registerAndOpenTab` from workspace
- [x] T012 [US2] Update `ShellManager` unit tests in `src/app/shell/shell-manager.service.spec.ts` — change `addTab` test to expect `registerAndOpenTab` with `componentType` on the tab object
- [x] T013 [US2] Update duplicate tab test in `src/app/shell/shell-manager.service.spec.ts` to verify `registerAndOpenTab` is dispatched only once for duplicate IDs

**Checkpoint**: `ShellManager.addTab()` now uses the unified workspace action. Mock content initialization works without API changes.

---

## Phase 4: User Story 3 — Close guards continue to work for dirty tabs (Priority: P2)

**Goal**: Workspace selectors provide close guards derived from each tab's `closeGuard` property, so TabBarComponent can consult them when closing dirty tabs.

**Independent Test**: Mark a tab as dirty, register a close guard that returns `false`, attempt to close the tab, and verify it remains open.

### Implementation for User Story 3

- [x] T014 [P] [US3] Add `selectCloseGuardsForGroup(groupId: string)` selector in `src/app/core/state/workspace/workspace.selectors.ts` — reduces tab array to `Record<tabId, TabCloseGuard>`, filtering out tabs without guards
- [x] T015 [P] [US3] Add `selectActiveShellTab(groupId: string)` selector in `src/app/core/state/workspace/workspace.selectors.ts` — returns full `TabItem | null` for the active tab
- [x] T016 [US3] Add unit tests for new selectors in `src/app/core/state/workspace/workspace.reducer.spec.ts` (selectors describe block) — test `selectCloseGuardsForGroup` returns correct map, test `selectActiveShellTab` returns active tab metadata
- [x] T017 [US3] Add unit tests for close guard behavior in `src/app/core/state/workspace/workspace.reducer.spec.ts` — test that `closeTab` correctly removes a tab with a closeGuard, test that pinned tabs with guards are still protected

**Checkpoint**: Close guards are accessible via workspace selectors. TabBarComponent can receive guards from workspace state.

---

## Phase 5: User Story 4 — Shell component reads all tab state from workspace slice (Priority: P2)

**Goal**: ShellComponent sources all tab-related observables from workspace selectors. The shellContent slice is completely removed from the application.

**Independent Test**: After the refactor, verify that no selectors from shellContent are imported or used by ShellComponent for tab-related concerns, and that shellContent slice no longer exists.

### Implementation for User Story 4

- [x] T018 [P] [US4] Add `selectShellTabs(groupId: string)` selector in `src/app/core/state/workspace/workspace.selectors.ts` — returns `TabItem[]` for the specified group
- [x] T019 [P] [US4] Add `selectActiveShellTabId(groupId: string)` selector in `src/app/core/state/workspace/workspace.selectors.ts` — returns `string | null`
- [x] T020 [P] [US4] Add `selectActiveShellComponentType(groupId: string)` selector in `src/app/core/state/workspace/workspace.selectors.ts` — returns `Type<unknown> | null` from active tab's `componentType`
- [x] T021 [US4] Add unit tests for new selectors in `src/app/core/state/workspace/workspace.reducer.spec.ts` — test `selectShellTabs`, `selectActiveShellTabId`, `selectActiveShellComponentType` return correct values
- [x] T022 [US4] Update `ShellComponent` imports in `src/app/shell/shell.component.ts` — replace shellContent imports (`selectShellTabs`, `selectActiveShellTabId`, `selectActiveShellComponentType`, `setActiveShellTab`) with workspace equivalents; update `onShellTabSelected` to dispatch workspace `selectTab` action
- [x] T023 [US4] Update `ShellComponent` observable declarations in `src/app/shell/shell.component.ts` — change `shellTabs$`, `activeShellTabId$`, `activeShellComponentType$` to use workspace selectors with `groupId: 'main'`
- [x] T024 [US4] Remove `provideState('shellContent', shellContentReducer)` from `src/app/app.config.ts`
- [x] T025 [US4] Remove `shellContent?: ShellContentState` property and `ShellContentState` import from `src/app/core/state/app.state.ts`
- [x] T026 [US4] Delete entire `src/app/core/state/shell-content/` directory (reducer, actions, selectors, index, spec files)
- [x] T027 [US4] Update `ShellComponent` tests in `src/app/shell/shell.component.spec.ts` — verify no shellContent imports, verify tab observables work with workspace selectors

**Checkpoint**: ShellComponent reads all tab state from workspace. shellContent slice is completely removed. No shellContent imports remain in the codebase.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Migration of remaining shellContent tests, verification, and cleanup.

- [x] T028 [P] Verify secondary panel state (sidebar, toolbar, bottom panel, secondary panel entries) remains functional after shellContent deletion — these are managed by a separate slice and are out-of-scope for this refactor
- [x] T029 [P] Verify no secondary panel selectors were imported from shellContent by ShellComponent — confirm they are sourced from the correct slice (if any)
- [x] T030 Run full test suite (`ng test`) and verify all tests pass with zero failures
- [x] T031 Verify no `shellContent` or `shell-content` imports remain in the codebase (run `rg "shell-content" src/` and `rg "shellContent" src/`)
- [x] T032 Verify build succeeds (`ng build`)
- [x] T033 Verify mock content initialization works — run app and confirm dashboard and reports tabs appear and are closable
- [x] T034 [P] Verify tab switch performance with 10+ tabs — measure time from tab click to content render; confirm < 120 ms per SC-005

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 2)**: Depends on Foundational (T001–T003). Implements registerTab, openTab, registerAndOpenTab.
- **User Story 2 (Phase 3)**: Depends on US1 (T004–T006). ShellManager needs registerAndOpenTab to exist.
- **User Story 3 (Phase 4)**: Depends on US1 (T004–T006). Selectors need the new state shape.
- **User Story 4 (Phase 5)**: Depends on US1 (T004–T006) and US3 (T014–T015). ShellComponent needs all selectors.
- **Polish (Phase 6)**: Depends on all user story phases complete.

### User Story Dependencies

```
Phase 1 (Foundational) ──┬──> Phase 2 (US1: registerTab/openTab) ──┬──> Phase 3 (US2: ShellManager)
                          │                                         ├──> Phase 4 (US3: Close guards)
                          │                                         └──> Phase 5 (US4: ShellComponent + cleanup)
                          │
                          └─────────────────────────────────────────> Phase 6 (Polish)
```

- **US1 (P1)**: Can start after Foundational. No dependencies on other stories.
- **US2 (P1)**: Depends on US1 (needs registerAndOpenTab action).
- **US3 (P2)**: Depends on US1 (needs new state shape). Independent of US2.
- **US4 (P2)**: Depends on US1 and US3 (needs all selectors). Independent of US2.

### Within Each User Story

- Models/actions before reducers
- Reducers before selectors
- Selectors before component integration
- Component integration before deletion of old code

### Parallel Opportunities

- T001, T002, T003 can run in parallel (different files, no dependencies)
- T018, T019, T020 can run in parallel (different selectors, same file but independent)
- T024, T025, T026 can run in parallel (different files, no dependencies between them)
- T028, T029, T034 can run in parallel (all verification tasks, different concerns)

---

## Parallel Example: User Story 4

```bash
# Launch all new selectors together (different selectors, same file):
Task: "Add selectShellTabs selector in workspace.selectors.ts"
Task: "Add selectActiveShellTabId selector in workspace.selectors.ts"
Task: "Add selectActiveShellComponentType selector in workspace.selectors.ts"

# Launch cleanup tasks together (different files):
Task: "Remove provideState from app.config.ts"
Task: "Remove shellContent from app.state.ts"
Task: "Delete shell-content directory"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T003)
2. Complete Phase 2: User Story 1 (T004–T009)
3. **STOP and VALIDATE**: Verify `registerTab`, `openTab`, `registerAndOpenTab` work correctly. Existing workspace tests still pass.
4. At this point, the core reducer logic is ready but ShellManager and ShellComponent still use the old shellContent slice.

### Incremental Delivery

1. Complete Foundational → Model extended, actions defined
2. Add US1 → registerTab/openTab/registerAndOpenTab work in reducer
3. Add US2 → ShellManager uses registerAndOpenTab
4. Add US3 → Close guard selectors available
5. Add US4 → ShellComponent reads from workspace, shellContent deleted
6. Polish → Tests migrated, full suite passes, build succeeds

### Parallel Team Strategy

With multiple developers:

1. Developer A: Foundational (T001–T003) → US1 (T004–T009)
2. Once US1 is done:
   - Developer B: US2 (T010–T013)
   - Developer C: US3 (T014–T017)
3. Once US1 + US3 are done:
   - Developer A or B: US4 (T018–T027)
4. All: Polish (T028–T034)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The `openTab` action signature changes: it now expects an already-registered tab. The reducer behavior changes per research.md Decision 3.
- `registerAndOpenTab` is implemented as a reducer handler that sequentially applies registerTab then openTab logic within a single call. No Effect is needed.
- Secondary panel state (sidebar, toolbar, bottom panel, secondary panel entries) remains in a separate slice — this refactor only touches central tab management.
