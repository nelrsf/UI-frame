# Tasks: UI Frame Shell OCP — ShellManager & Region Contracts

**Branch**: `002-validate-ui-frame` | **Date**: 2026-05-04
**Input**: `specs/002-validate-ui-frame/plan.md`, `spec.md`, `data-model.md`, `research.md`, `quickstart.md`, `contracts/`

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Task is parallelizable (independent file, no in-flight dependency)
- **[US1/US2/US3]**: User story this task belongs to (setup and foundational phases omit this label)
- All paths are relative to the repository root

---

## Phase 1: Setup — Delete Legacy Artifacts

> Goal: Remove the `MockUiScreenComponent` approach and revert `AppComponent` to its clean state before adding the new OCP architecture.
>
> Independent Test: No reference to `MockUiScreenComponent`, `showMockUi`, or `dev-toggle-btn` exists in any tracked file. `npm test` produces zero compilation errors.

- [X]  Delete all 4 files in `src/app/shell/mock-ui/screen/` (mock-ui-screen.component.ts, .html, .css, .spec.ts)
- [X]  Revert `src/app/app.component.ts` — remove `showMockUi`, `toggleMockUi()`, and `MockUiScreenComponent` import; keep only `AppComponent` rendering `<app-shell>`
- [X]  Revert `src/app/app.component.html` — remove dev toggle button and `@if(showMockUi)` block; keep only `<app-shell></app-shell>`
- [X]  Revert `src/app/app.component.css` — remove `.dev-toggle-btn` styles; leave file empty
- [X]  Remove `src/app/shell/mock-ui/models/mock-ui-screen-state.model.ts` and update `src/app/shell/mock-ui/models/index.ts` barrel to remove its export
- [X]  Update `src/app/shell/mock-ui/index.ts` — remove `MockUiScreenComponent` export; keep fixture and model re-exports

---

## Phase 2: Foundational — Contracts, NgRx Slice, ContentArea

> Goal: Establish all prerequisites that block user story implementation: the 4 public region contracts, the `shellContent` NgRx slice, and the `ContentAreaComponent` dynamic rendering capability.
>
> Independent Test: `npx tsc --noEmit` reports zero errors after this phase. No user story code exists yet — only infrastructure.

- [X]  [P] Create `src/app/shell/contracts/ICentralRegionTab.ts` — export interface with fields: `id: string`, `label: string`, `component: Type<unknown>`, `icon?: string`, `closable?: boolean`
- [X]  [P] Create `src/app/shell/contracts/ISidebarEntry.ts` — export interface with fields: `id: string`, `label: string`, `icon: string`, `tooltip?: string`
- [X]  [P] Create `src/app/shell/contracts/IToolbarAction.ts` — export interface with fields: `id: string`, `label: string`, `icon: string`, `handler: () => void`, `tooltip?: string`
- [X]  [P] Create `src/app/shell/contracts/IBottomPanelEntry.ts` — export interface with fields: `id: string`, `label: string`, `icon?: string`
- [X]  Create `src/app/shell/contracts/index.ts` — barrel exporting all four contract interfaces using `export type { ... }`
- [X]  Create `src/app/core/state/shell-content/shell-content.actions.ts` — NgRx actions using `createAction` + `props<>`: `addShellTab` (props: `{ tabItem: TabItem, componentType: Type<unknown> }`), `setActiveShellTab` (props: `{ id: string }`), `addSidebarEntry` (props: `SidebarItem`), `addToolbarAction` (props: `ToolbarAction`), `addBottomPanelEntry` (props: `PanelTab`). Note: ShellManager (T019) performs the translation from region contracts to these internal DTOs. The `ShellTab` type is defined in T013.
- [X]  Create `src/app/core/state/shell-content/shell-content.reducer.ts` — define `ShellTab` interface (`tabItem: TabItem`, `componentType: Type<unknown>`), `ShellContentState` interface, `initialShellContentState`, and `shellContentReducer` with duplicate-ID guard on each `add*` action
- [X]  Create `src/app/core/state/shell-content/shell-content.selectors.ts` — feature selector `selectShellContentState` and derived selectors: `selectShellTabs`, `selectActiveShellTabId`, `selectActiveShellComponentType`, `selectShellSidebarItems`, `selectShellToolbarActions`, `selectShellBottomPanelTabs`
- [X]  Create `src/app/core/state/shell-content/index.ts` — barrel re-exporting all from actions, reducer, and selectors
- [X]  Register `shellContent` slice in `src/app/app.config.ts` via `provideState('shellContent', shellContentReducer)` and add `shellContent?: ShellContentState` to `AppState` in `src/app/core/state/app.state.ts`
- [X]  [P] Add `@Input() componentType: Type<unknown> | null = null` to `src/app/shell/components/content-area/content-area.component.ts` and add `NgComponentOutlet` to the `imports` array
- [X]  [P] Update `src/app/shell/components/content-area/content-area.component.html` — replace the placeholder comment inside `.content-area__view` with `<ng-container *ngComponentOutlet="componentType"></ng-container>`

---

## Phase 3: User Story 1 — ShellManager Service & Shell Wiring

> **US1 Goal**: Any domain developer calls `shellManager.addTab()`, `addSidebarEntry()`, `addToolbarAction()`, or `addBottomPanelEntry()` to populate the shell without modifying any file under `src/app/shell/components/` or `src/app/shell/shell.component.ts`.
>
> Independent Test: `ShellManagerService` unit tests pass. `ShellComponent` renders data dispatched to the `shellContent` store slice. Zero shell source files reference a domain or mock type.

- [X]  [US1] Create `src/app/shell/shell-manager.service.ts` — `@Injectable({ providedIn: 'root' })` injecting `Store<AppState>` and `CommandRegistryService`; implement `addTab(tab: ICentralRegionTab)`, `addSidebarEntry(entry: ISidebarEntry)`, `addToolbarAction(action: IToolbarAction)`, `addBottomPanelEntry(panel: IBottomPanelEntry)`; each method (a) maintains a private `Set<string>` of registered IDs for duplicate detection, returns early with `console.warn` if found, (b) maps contract to internal DTO, (c) dispatches the `shellContent` action; `addToolbarAction` additionally calls `commandRegistry.register({ id: 'shell.action.' + action.id, execute: action.handler })`
- [X]  [US1] Create `src/app/shell/shell-manager.service.spec.ts` — Jasmine tests with `TestBed`, `MockStore`, and a spy for `CommandRegistryService`; cover: `addTab` dispatches `addShellTab`; `addSidebarEntry` dispatches `addSidebarEntry`; `addToolbarAction` calls `commandRegistry.register` and dispatches `addToolbarAction` with `commandId = 'shell.action.' + id`; `addBottomPanelEntry` dispatches `addBottomPanelEntry`; duplicate `id` is silently ignored (dispatch not called on second call); handler that throws an exception does not propagate (CommandRegistry contains the error, logs it, and the shell remains stable)
- [X]  [US1] Update `src/app/shell/shell.component.ts` — inject `Store` selectors for `shellContent`: `sidebarItems$`, `toolbarActions$`, `shellTabs$`, `activeShellTabId$`, `activeShellComponentType$`, `bottomPanelTabs$` as `Observable<>` fields; do NOT import any domain or mock type
- [X]  [US1] Update `src/app/shell/shell.component.html` — bind `[items]="sidebarItems$ | async"` on `<app-sidebar>`, `[actions]="toolbarActions$ | async"` on `<app-toolbar>`, `[tabs]="shellTabs$ | async"` and `[activeTabId]="activeShellTabId$ | async"` on `<app-tab-bar>`, `[componentType]="activeShellComponentType$ | async"` on `<app-content-area>`, `[panels]="bottomPanelTabs$ | async"` on `<app-bottom-panel>`

---

## Phase 4: User Story 2 — Mock Reference Implementations

> **US2 Goal**: The mock objects in `src/app/shell/mock-ui/` implement the region contracts and are registered via `ShellManager` at bootstrap, proving the contracts are sufficient to populate all four shell regions with visible content.
>
> Independent Test: `npx tsc --noEmit` zero errors. Running `npm start` shows: Dashboard tab, Reports tab, 4 toolbar buttons, 2 sidebar entries (Navigation/Tools), and 3 bottom panels (Results/Logs/Warnings) — all rendered in the live shell without `MockUiScreenComponent`.

- [X]  [P] [US2] Create `src/app/shell/mock-ui/components/mock-dashboard/mock-dashboard.component.ts` and `.html` — standalone Angular component that renders labeled fake KPI cards using `dashboard-cards.fixtures.ts` data
- [X]  [P] [US2] Create `src/app/shell/mock-ui/components/mock-reports/mock-reports.component.ts` and `.html` — standalone Angular component that renders a labeled fake reports table using `report-rows.fixtures.ts` data
- [X]  [US2] Create `src/app/shell/mock-ui/mock-registrations.ts` — single file exporting 11 typed contract constants: `MOCK_DASHBOARD_TAB: ICentralRegionTab` (component: `MockDashboardComponent`), `MOCK_REPORTS_TAB: ICentralRegionTab` (component: `MockReportsComponent`), `MOCK_ALERT_INFO: IToolbarAction`, `MOCK_ALERT_WARNING: IToolbarAction`, `MOCK_ALERT_ERROR: IToolbarAction`, `MOCK_ALERT_SUCCESS: IToolbarAction` (each handler calls `window.alert` with level + message for dev validation), `MOCK_NAV_SIDEBAR_ENTRY: ISidebarEntry`, `MOCK_TOOLS_SIDEBAR_ENTRY: ISidebarEntry`, `MOCK_RESULTS_PANEL: IBottomPanelEntry`, `MOCK_LOGS_PANEL: IBottomPanelEntry`, `MOCK_WARNINGS_PANEL: IBottomPanelEntry`
- [X]  [US2] Create `src/app/shell/mock-ui/mock-content.initializer.ts` — export `registerMockContent(shell: ShellManager): void` that calls `shell.addTab`, `shell.addSidebarEntry`, `shell.addToolbarAction` (×4 alerts), `shell.addBottomPanelEntry` using constants from `mock-registrations.ts`
- [X]  [US2] Update `src/app/app.config.ts` — add `APP_INITIALIZER` provider after `provideState('shellContent', ...)` that injects `ShellManager` and invokes `registerMockContent(shell)`

---

## Phase 5: User Story 3 — Documentation Verification

> **US3 Goal**: The quickstart guide is accurate for the implementation delivered in Phases 2–4, so any team member can follow it to register a new `ICentralRegionTab` in under 15 minutes without opening shell source.
>
> Independent Test: Manually follow quickstart steps 1–5 and verify every file path, method signature, and interface field matches the actual codebase.

- [X]  [US3] Verify and update `specs/002-validate-ui-frame/quickstart.md` — fix any discrepancies in file paths, method signatures, interface field names, `APP_INITIALIZER` snippet, or example outputs introduced during Phases 2–4

---

## Final Phase: Polish & Cross-Cutting Concerns

- [X]  [P] Run `npx tsc --noEmit` from repo root and resolve any TypeScript errors across the new contracts, `shellContent` slice, `ShellManagerService`, mock components, and wired shell files
- [X]  [P] Run `npm test` — all existing Jasmine tests must pass; new `ShellManagerService` tests must pass; reverted `AppComponent` spec must pass

---

## Dependencies

```
T001–T006  (Phase 1: Setup / no deps)
     │
     ▼
T007–T011  (Phase 2: Contracts)    T017–T018  (Phase 2: ContentArea — parallel with contracts)
     │
     ▼
T012 ──► T013 ──► T014 ──► T015 ──► T016  (Phase 2: NgRx slice)
                                      │
                     ┌────────────────┘
                     ▼
              T019–T022  (Phase 3 [US1]: ShellManager + Shell wiring)
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   T023–T024 [P]          T025 ──► T026 ──► T027  (Phase 4 [US2]: Mocks + bootstrap)
   (mock components)
                                      │
                               T028  (Phase 5 [US3]: docs verify)
                                      │
                               T029–T030 [P]  (Final: tsc + tests)
```

**Parallel opportunities**:
- T007–T010: 4 contract files, fully independent
- T017–T018: ContentArea update, independent of contracts
- T023–T024: mock component files, independent of each other
- T029–T030: CLI commands, independent of each other

---

## Implementation Strategy

**MVP scope** = T001–T022 (Phases 1–3). At this milestone `ShellManager` is live, the shell reads from the store, and any developer can call the API to verify OCP without mock content.

**US2 increment** (T023–T027): Adds mock registrations and `APP_INITIALIZER` wiring — the app becomes visually testable with all regions populated.

**US3 increment** (T028): Documentation sync — low risk, high team-onboarding value.

**Validation** (T029–T030): Confirms SC-003 (`tsc --noEmit` zero errors) and SC-002 (all mocks visible in shell) are met before the feature is declared done.

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 30 |
| Phase 1 (Setup) | 6 |
| Phase 2 (Foundational) | 12 |
| Phase 3 — US1 | 4 |
| Phase 4 — US2 | 5 |
| Phase 5 — US3 | 1 |
| Final (Polish) | 2 |
| Parallel opportunities | T007–T010 (×4), T017–T018 (×2), T023–T024 (×2), T029–T030 (×2) |
| MVP scope | T001–T022 (Phases 1–3) |

## Requirement Coverage

| Requirement | Covered By |
|-------------|-----------|
| FR-001 — ShellManager injectable | T019 |
| FR-002 — `ICentralRegionTab` + NgComponentOutlet | T007, T011, T017, T018 |
| FR-003 — `ISidebarEntry` | T008, T011 |
| FR-004 — `IToolbarAction` + CommandRegistry auto-registration | T009, T011, T019 |
| FR-005 — `IBottomPanelEntry` | T010, T011 |
| FR-006 — ShellManager → DTOs + NgRx dispatch | T012–T016, T019 |
| FR-007 — Shell components never import domain/mock types | T021, T022 (wiring via selectors only) |
| FR-008 — Mocks implement contracts + APP_INITIALIZER | T023–T027 |
| FR-009 — Delete MockUiScreenComponent + revert AppComponent | T001–T006 |
| FR-010 — Contracts in `src/app/shell/contracts/` | T007–T011 |
| FR-011 — quickstart.md accurate and referenced | T028 |
| SC-001 — All 4 regions populate | T022, T027 |
| SC-002 — Mocks visible in live shell | T025–T027 |
| SC-003 — Zero tsc errors | T029 |

