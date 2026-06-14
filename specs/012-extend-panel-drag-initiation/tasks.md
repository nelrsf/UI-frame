---
description: "Task list for extending drag initiation to dock-zone panels and persisting moved/reordered tabs"
---

# Tasks: Extend Panel Drag Initiation

**Input**: Design documents from `/specs/012-extend-panel-drag-initiation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/README.md
**Current Alignment**: Updated 2026-06-14 to match the generic dock-zone implementation now present in the codebase.

**Tests**: Unit and integration tests are required for drag initiation, cross-zone moves, same-zone reorder, and workspace-session persistence/restore.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Shell UI: `src/app/shell/`
- Core models/state/persistence: `src/app/core/`

## Phase 1: Current Implementation Baseline

**Purpose**: Capture the implementation that replaced the original bottom/secondary-component-specific plan.

- [x] T001 Verify `DockZonePanelComponent` is the generic tab-bar surface for primary workspace, bottom, and secondary dock zones at `src/app/shell/components/dock-zone-panel/dock-zone-panel.component.ts`
- [x] T002 [P] Verify `DockZone` includes current split-zone values in `src/app/core/models/dock-zone-assignment.model.ts`
- [x] T003 [P] Verify draggable compatibility is represented by `ShellTab.draggable.allowableDropTargets` in `src/app/shell/models/tab-item.model.ts`
- [x] T004 Verify runtime workspace state stores tabs by zone through `tabsByZone` and active tabs through `activeTabIdsByZone` in `src/app/core/state/workspace/workspace.reducer.ts`

---

## Phase 2: Drag Initiation and Runtime NgRx Updates

**Purpose**: Confirm the implemented drag feature uses the current architecture.

- [x] T005 [US1,US2,US3] Add/verify `(pointerdown)` binding on dock-zone tab elements in `src/app/shell/components/dock-zone-panel/dock-zone-panel.component.html`
- [x] T006 [US1,US2,US3] Add/verify `onTabPointerDown(event: PointerEvent, tab: ShellTab)` in `src/app/shell/components/dock-zone-panel/dock-zone-panel.component.ts`
- [x] T007 [US1,US2,US3] Ensure `onTabPointerDown` ignores non-primary mouse buttons before calling `DragDropService.startDrag`
- [x] T008 [US1,US2] Ensure `DragDropService` evaluates target compatibility from `draggedTab.draggable.allowableDropTargets` in `src/app/shell/services/drag-drop.service.ts`
- [x] T009 [US1,US2] Ensure cross-zone drops dispatch `moveTabToZone` in `src/app/shell/services/drag-drop.service.ts`
- [x] T010 [US3] Ensure same-zone drops dispatch `reorderTab` with the detected insertion index in `src/app/shell/services/drag-drop.service.ts`
- [x] T011 [US1,US2,US3] Ensure `workspace.reducer.ts` updates `tabsByZone` and `activeTabIdsByZone` for move and reorder actions

---

## Phase 3: Restore Test Suite Alignment

**Purpose**: Fix tests that still target the older three-zone and panel-specific APIs.

- [ ] T012 [P] Replace obsolete `DockZone.PrimaryWorkspace` and `DockZone.BottomPanel` test references with current `DockZone` values in `src/app/shell/services/drag-drop.service.spec.ts`
- [ ] T013 [P] Replace obsolete `DockZone.PrimaryWorkspace` and `DockZone.BottomPanel` test references with current `DockZone` values in `src/app/shell/components/drag-ghost/drag-ghost.component.spec.ts`
- [ ] T014 [P] Update `src/app/shell/docking.integration.spec.ts` to assert the current split dock-zone model rather than the older three-zone model
- [ ] T015 Update `src/app/core/state/workspace/workspace.reducer.spec.ts` to use `tabsByZone`, `activeTabIdsByZone`, `openTab({ tab, zone })`, `moveTabToZone`, and `reorderTab`
- [ ] T016 Update `src/app/shell/shell-manager.service.spec.ts` for the current `ShellManager.addTab(tab, zone, guard?)` contract and remove obsolete `addBottomPanelEntry` / `addSecondaryPanelEntry` expectations
- [ ] T017 Update `src/app/core/services/workspace-session.service.spec.ts` to use current dock-zone enum values
- [ ] T018 Update `src/app/core/state/layout/layout.spec.ts` fixture state to include `splitPanelLayout`

---

## Phase 4: User Story 4 - Persist and Restore Moved/Reordered Tabs

**Goal**: Connect successful drag moves and reorders to workspace-session persistence so restorable tabs keep dock-zone membership, order, and active selection after reload.

**Independent Test**: Move a restorable tab across zones, reorder tabs in a zone, save/restore the workspace session, and verify restored `tabsByZone` and `activeTabIdsByZone` match the final runtime state.

### Persistence Model

- [ ] T019 [US4] Verify `src/app/core/models/tab-descriptor.model.ts` has enough serializable metadata to restore tab identity, dock zone, order, pinned state, and closeability
- [ ] T020 [US4] If needed, extend `TabDescriptor` or `WorkspaceSession` to represent per-zone tab order without storing Angular component references
- [ ] T021 [US4] Add tests for valid moved/reordered tab snapshots in `src/app/core/services/workspace-session.service.spec.ts`
- [ ] T022 [US4] Add tests for corrupt, schema-incompatible, duplicate, or unavailable persisted tab descriptors in `src/app/core/services/workspace-session.service.spec.ts`

### NgRx Save Path

- [ ] T023 [US4] Add a selector or helper that converts `WorkspaceState.tabsByZone` and `activeTabIdsByZone` into a restorable `WorkspaceSession` tab snapshot in `src/app/core/state/workspace/` or an existing session orchestration boundary
- [ ] T024 [US4] Wire successful `moveTabToZone` and `reorderTab` state changes to workspace-session saving without bypassing NgRx in `src/app/shell/shell.component.ts` or an NgRx effect
- [ ] T025 [US4] Ensure the save path preserves tab order per zone and active tab per zone after cross-zone moves and same-zone reorders
- [ ] T026 [US4] Ensure non-restorable tabs are omitted from persisted snapshots without disturbing restorable tab order

### NgRx Restore Path

- [ ] T027 [US4] Add or update workspace restore action(s) so a valid session can rehydrate `tabsByZone` and `activeTabIdsByZone` in `src/app/core/state/workspace/workspace.actions.ts`
- [ ] T028 [US4] Add reducer handling for workspace tab restore in `src/app/core/state/workspace/workspace.reducer.ts`
- [ ] T029 [US4] Update `src/app/shell/shell.component.ts` startup restore wiring to dispatch workspace tab restoration in addition to layout restoration
- [ ] T030 [US4] Ensure restore does not duplicate tabs already registered/open and falls back safely when descriptor factories are unavailable

### Persistence Verification

- [ ] T031 [US4] Add reducer tests for restoring tab membership, per-zone order, and active tab selection in `src/app/core/state/workspace/workspace.reducer.spec.ts`
- [ ] T032 [US4] Add shell integration tests proving a move plus reorder survives workspace-session save/restore in `src/app/shell/` or `src/app/core/services/`
- [ ] T033 [US4] Add regression coverage proving cancelled or incompatible drags do not change persisted tab membership/order

---

## Phase 5: Documentation and Validation

- [ ] T034 [P] Update `specs/012-extend-panel-drag-initiation/quickstart.md` with the current dock-zone and persistence validation flow
- [ ] T035 [P] Update `specs/012-extend-panel-drag-initiation/contracts/README.md` to reflect `DockZonePanelComponent`, `DragDropService`, `moveTabToZone`, `reorderTab`, and workspace-session restore contracts
- [ ] T036 Run `npm.cmd run build` and confirm the application still builds
- [ ] T037 Run `npm.cmd run test:coverage:ci` and confirm the suite compiles and passes

---

## Dependencies & Execution Order

- Phase 3 should happen before Phase 4 verification so failing legacy specs do not hide persistence regressions.
- T019-T022 clarify the persistence shape before save/restore wiring.
- T023-T026 define and verify the save path before restore behavior is finalized.
- T027-T030 define and verify restore before integration tests.
- T036 can run after model and compile changes; T037 is the final gate.

## Notes

- Do not reintroduce `BottomPanelComponent`, `SecondaryPanelComponent`, `reorderBottomPanelTabs`, or `reorderSecondaryPanelEntries` as feature-specific contracts.
- Do not persist Angular component references. Persist only serializable descriptors and reconstruct runtime tabs through existing registration/factory mechanisms.
- Runtime drag state is transient; only successful move/reorder outcomes belong in persisted workspace sessions.
- The current implementation build passes, but the test suite currently fails because specs still reference obsolete zone names and removed actions.
