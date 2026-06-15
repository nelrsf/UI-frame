# Tasks: Shell Split Panels

**Input**: Design documents from `/specs/013-shell-split-panels/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare component scaffolding and state foundations for split layout support.

- [x] T001 Create `src/app/shell/components/layout-splittable-panel/` scaffolding (component, html, css)
- [x] T002 [P] Create `src/app/shell/models/layout-splittable-region.model.ts` with `LayoutSplitDirection` and `LayoutSplittableRegionModel`
- [x] T003 [P] Add split layout actions to `src/app/core/state/layout/layout.actions.ts` for `setSplitLayout` and `setSplitPaneSize`
- [x] T004 [P] Extend `src/app/core/state/layout/layout.reducer.ts` to persist `splitPanelLayout`
- [x] T005 [P] Add split layout selectors to `src/app/core/state/layout/layout.selectors.ts`
- [x] T006 [P] Register `LayoutSplittablePanelComponent` in `ShellComponent` imports

---

## Phase 2: Foundational (Grid Implementation)

**Purpose**: Build the split wrapper logic using the 2D grid visibility model.

- [x] T007 Implement `LayoutSplittablePanelComponent` with inputs: `direction`, `zones` (matrix), and `visible`
- [x] T008 Implement 2D `panelStates` matrix initialization and visibility management
- [x] T009 Implement `onSplitPanels` logic to toggle visibility of adjacent rows/columns
- [x] T010 Implement `onVisibilityChange` with automatic tab migration to first active panel
- [x] T011 Implement `LayoutSplittablePanelComponent` HTML with nested `@for` loops for rows and columns
- [x] T012 Integrate `app-shell-splitter-handle` for resizable boundaries between visible panels
- [x] T013 Wire `closePanel` output to `ShellComponent` and NgRx state updates

---

## Phase 3: Shell Integration (User Stories 1 & 2)

**Goal**: Integration of the splittable panel in the primary workspace and bottom panel.

- [x] T014 [US1] Configure primary workspace in `shell.component.html` with 2x2 `DockZone` matrix and `direction="vertical"`
- [x] T015 [US1] Verify vertical split functionality and tab dragging between workspace panes
- [x] T016 [US2] Configure bottom panel in `shell.component.html` with 1x3 `DockZone` matrix and `direction="horizontal"`
- [x] T017 [US2] Verify horizontal split functionality and content dragging between bottom panes
- [x] T018 Verify `DragDropService` registration for all panels within the splittable grid

---

## Phase 4: Split Limit Enforcement (User Story 3)

**Goal**: Prevent splitting beyond the predefined grid capacity.

- [x] T019 Implement logic to hide split buttons when all grid panels are already visible (`areAllPanelsVisible` / `areAllRowsVisible`)
- [x] T020 Verify split button visibility toggles correctly as panels are opened/closed
- [x] T021 Add styling for split buttons in `layout-splittable-panel.component.css`

---

## Phase 5: Polish & Verification

**Purpose**: Refine visuals, verify persistence, and document.

- [x] T022 [P] Add comprehensive unit tests for `LayoutSplittablePanelComponent` (visibility, splitting, tab migration)
- [x] T023 [P] Verify that `splitPanelLayout` is correctly restored from NgRx state upon shell restart
- [x] T024 [P] Finalize documentation in `specs/013-shell-split-panels/quickstart.md` reflecting the grid-based implementation
- [x] T025 [P] Audit `LayoutSplittablePanelComponent` for unused imports/code (e.g., `NgStyle` warning from build)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Completed
- **Foundational (Phase 2)**: Completed
- **Integration (Phase 3)**: Completed
- **Enforcement (Phase 4)**: Completed
- **Polish (Phase 5)**: Pending

### Parallel Opportunities
- Polish tasks (T022-T025) can be executed in parallel.
