# Tasks: Shell Split Panels

**Input**: Design documents from `/specs/013-shell-split-panels/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare component scaffolding and state foundations for split layout support.

- [x] T001 Create `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts`, `layout-splittable-panel.component.html`, and `layout-splittable-panel.component.css`
- [x] T002 [P] Create `src/app/core/models/layout-splittable-region.model.ts` with `LayoutSplittableRegionModel`, `LayoutSplitSubRegion`, and `LayoutSplitDirection`
- [x] T003 [P] Add split layout actions to `src/app/core/state/layout/layout.actions.ts` for `setSplitLayout` and `setSplitPaneSize`
- [x] T004 [P] Extend `src/app/core/state/layout/layout.reducer.ts` to persist `splitPanelLayout` and handle split layout actions
- [x] T005 [P] Add split layout selectors to `src/app/core/state/layout/layout.selectors.ts`
- [x] T006 [P] Add `layout-splittable-panel` component imports/registration in `src/app/shell/shell.component.ts` or relevant shell module so it can be rendered by the shell

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the split wrapper logic and NgRx connection required for all user stories.

- [x] T007 Implement `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts` to expose inputs: `direction`, `regions`, and `maxSubRegions`
- [ ] T008 Implement `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.html` to render a cyclic pattern of `app-dock-zone-panel` and separators
- [ ] T009 Implement `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts` split button logic and `splitRequested` output event
- [ ] T010 Wire `layout-splittable-panel` event output to NgRx updates in `src/app/shell/shell.component.ts`
- [ ] T011 Update `src/app/shell/shell.component.html` to support rendering `layout-splittable-panel` for the central workspace and bottom panel regions
- [ ] T012 Add basic shell integration logic in `src/app/shell/shell.component.ts` to pass layout state into `layout-splittable-panel` and dispatch NgRx split layout actions

---

## Phase 3: User Story 1 - Split Central Region Tabs (Priority: P1)

**Goal**: User can split the central region tabs into two vertical panes and drag tabs between them.

**Independent Test**: Click the central region split button, verify two vertical panes appear, and drag tabs between them.

- [ ] T013 [US1] Implement central workspace vertical split button in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.html`
- [ ] T014 [US1] Render the primary workspace region via `layout-splittable-panel` in `src/app/shell/shell.component.html` with `direction="vertical"`
- [ ] T015 [US1] Implement split creation in `layout-splittable-panel.component.ts` so the first pane retains all tabs and the second pane starts empty
- [ ] T016 [US1] Ensure each generated pane uses `app-dock-zone-panel` and registers with `DragDropService` for tab reorder support
- [ ] T017 [US1] Persist central split layout updates to NgRx with `setSplitLayout` in `src/app/core/state/layout/layout.actions.ts`
- [ ] T018 [US1] Verify central region split support by testing tab drag behavior between left and right panes in `src/app/shell/components/layout-splittable-panel` context

---

## Phase 4: User Story 2 - Split Bottom Panel (Priority: P1)

**Goal**: User can split the bottom panel into two horizontal panes and drag components between them.

**Independent Test**: Click the bottom panel split button, verify two horizontal panes appear, and drag panel content between them.

- [ ] T019 [US2] Implement bottom panel horizontal split button support in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.html`
- [ ] T020 [US2] Render the bottom panel region via `layout-splittable-panel` in `src/app/shell/shell.component.html` with `direction="horizontal"`
- [ ] T021 [US2] Implement bottom panel split creation logic so the top pane contains existing panel content and the bottom pane starts empty
- [ ] T022 [US2] Ensure each bottom panel pane uses `app-dock-zone-panel` and supports existing panel drag/drop mechanics
- [ ] T023 [US2] Persist bottom split layout updates to NgRx in `src/app/core/state/layout/layout.reducer.ts`
- [ ] T024 [US2] Verify bottom panel split behavior by testing drag-and-drop of content between top and bottom panes

---

## Phase 5: User Story 3 - Split Limit Enforcement (Priority: P2)

**Goal**: Disable the split button once a region reaches `maxSubRegions`.

**Independent Test**: Repeatedly split until the button disables, then confirm further split attempts have no effect.

- [ ] T025 [US3] Implement `maxSubRegions` input handling in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts`
- [ ] T026 [US3] Disable the split button in `layout-splittable-panel.component.html` when current subregions count >= `maxSubRegions`
- [ ] T027 [US3] Add clear disabled styling and accessible labels for the split button in `layout-splittable-panel.component.css`
- [ ] T028 [US3] Ensure `maxSubRegions` enforcement is reflected in emitted NgRx split layout payloads
- [ ] T029 [US3] Validate split limit enforcement manually and confirm no additional panes are created past the limit

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Refine visuals, restore behavior, and document the feature.

- [ ] T030 [P] Add split direction icon visuals and accessible tooltips in `layout-splittable-panel.component.html`
- [ ] T031 [P] Implement separator styling and responsive split layout CSS in `layout-splittable-panel.component.css`
- [ ] T032 [P] Add unit tests for `layout-splittable-panel` behavior in `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.spec.ts`
- [ ] T033 [P] Document split panel usage and NgRx model behavior in `specs/013-shell-split-panels/quickstart.md`
- [ ] T034 [P] Verify persisted split layout restores correctly on shell startup via `src/app/shell/shell.component.ts`
- [ ] T035 [P] Refactor `layout-splittable-panel` event wiring and NgRx dispatch flow for readability

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion; can proceed in parallel once foundation is ready
- **Polish (Phase 6)**: Depends on User Stories completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundation is complete and is independently testable
- **User Story 2 (P1)**: Can start after Foundation is complete and is independently testable
- **User Story 3 (P2)**: Can start after Foundation is complete and is independently testable

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel
- User stories can run in parallel by different developers once foundation is complete
- Cross-cutting polish tasks marked [P] can run in parallel
