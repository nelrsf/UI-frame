# Feature Specification: Unify Workspace Tab Management

**Feature Branch**: `009-unify-workspace-tabs`  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: Refactor para unificar la gestión de tabs en el slice workspace, eliminando el slice shellContent.

## Clarifications

### Session 2026-05-20

- Q: ¿Dónde se almacenan componentType y closeGuard — en TabItem o en estructura paralela? → A: Option A — Extender TabItem directamente con componentType y closeGuard como propiedades del modelo.
- Q: ¿Nombre de la acción unificada de registro + apertura? → A: Option A — `registerAndOpenTab`
- Q: ¿Qué pasa con las acciones existentes openTab, closeTab, selectTab? → A: Custom — Tres acciones separadas: `registerTab` (registra sin mostrar), `openTab` (abre/muestra una tab ya registrada), `registerAndOpenTab` (facade que dispatchea registerTab + openTab). `closeTab`, `selectTab`, etc. se mantienen intactas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tabs render and behave from a single source of truth (Priority: P1)

As a user interacting with the application shell, I expect all tabs (open, close, select, reorder) to work consistently regardless of which internal state slice manages them. Currently, tabs displayed in the tab bar cannot be closed properly because the display and management state are split across two independent NgRx slices.

**Why this priority**: This is the core bug fix — without it, the tab close functionality is broken, making the application unreliable for any workflow involving multiple open views.

**Independent Test**: Open two tabs via the shell manager, then close one tab via the tab bar's close button. The tab must be removed from the display and the adjacent tab must become active.

**Acceptance Scenarios**:

1. **Given** two tabs are open in the shell, **When** the user clicks the close button on the second tab, **Then** the tab is removed from the tab bar and the first tab becomes active
2. **Given** two tabs are open with the first tab active, **When** the user closes the first tab, **Then** the second tab becomes active
3. **Given** a single tab is open, **When** the user closes it, **Then** the tab bar shows no tabs and no component is rendered in the content area
4. **Given** a pinned tab is open, **When** the user attempts to close it, **Then** the tab remains open and visible

---

### User Story 2 - Tab registration opens and displays the tab immediately (Priority: P1)

As a developer registering a new tab through the ShellManager, I expect a single registration call to both register the tab in state and make it visible and active in the UI, without needing to dispatch separate actions.

**Why this priority**: This eliminates the current incoherence where `addShellTab` registers a tab for display but never opens it in the workspace slice, causing `closeTab` to fail.

**Independent Test**: Register a new tab via `ShellManager.addTab()` and verify it appears in the tab bar, is selected as active, and its component renders in the content area.

**Acceptance Scenarios**:

1. **Given** no tabs are open, **When** `ShellManager.addTab()` is called with a new tab definition, **Then** the `registerAndOpenTab` facade dispatches `registerTab` and `openTab`, the tab appears in the tab bar and its component renders in the content area
2. **Given** a tab with the same ID is already registered, **When** `ShellManager.addTab()` is called with that same ID, **Then** the existing tab is activated and no duplicate is created
3. **Given** multiple tabs are registered during initialization, **Then** the first registered tab is active by default
4. **Given** a tab is registered via `registerTab` action directly, **When** no `openTab` is dispatched, **Then** the tab exists in state but is not visible in the tab bar

---

### User Story 3 - Close guards continue to work for dirty tabs (Priority: P2)

As a user editing content in a tab, I expect that when I try to close a tab with unsaved changes (dirty state), the system will consult the registered close guard before allowing the tab to close, just as it does today.

**Why this priority**: Preserves existing data-loss-prevention behavior during the refactor.

**Independent Test**: Mark a tab as dirty, register a close guard that returns `false`, attempt to close the tab, and verify it remains open.

**Acceptance Scenarios**:

1. **Given** a dirty tab with a close guard that returns `true`, **When** the user clicks close, **Then** the tab closes
2. **Given** a dirty tab with a close guard that returns `false`, **When** the user clicks close, **Then** the tab remains open
3. **Given** a dirty tab with an async close guard that times out (exceeds 10 seconds), **When** the user clicks close, **Then** the tab remains open and a timeout event is emitted
4. **Given** a dirty tab with no close guard registered, **When** the user clicks close, **Then** the tab closes without prompting

---

### User Story 4 - Shell component reads all tab state from workspace slice (Priority: P2)

As the application shell, I expect to derive all tab-related display data (tab list, active tab ID, component type to render, close guards) from a single NgRx slice (workspace), with no dependency on the removed shellContent slice for tab concerns.

**Why this priority**: Ensures the architectural goal of a single source of truth is achieved and maintained.

**Independent Test**: After the refactor, verify that no selectors from shellContent are imported or used by ShellComponent for tab-related concerns.

**Acceptance Scenarios**:

1. **Given** the refactor is complete, **When** ShellComponent renders, **Then** all tab observables (tabs list, active tab ID, active component type) are sourced from workspace selectors
2. **Given** the refactor is complete, **When** inspecting the codebase, **Then** the shellContent slice no longer exists (no reducer, actions, selectors, or state registration)

---

### Edge Cases

- What happens when a tab is registered with a component type that cannot be instantiated? The system should handle the error gracefully without crashing the shell.
- How does the system handle closing the last tab in the workspace? The content area should render empty state, not crash or show stale content.
- What happens if a close guard throws an error instead of returning a boolean? The tab should remain open (error is caught, close is denied).
- How does the system handle rapid successive tab open/close operations? Each operation should be processed in order without race conditions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The shellContent NgRx slice (reducer, actions, selectors, initial state, and state registration) MUST be completely removed from the application
- **FR-002**: The workspace slice MUST store, for each registered tab, optional metadata including the Angular component type needed for dynamic rendering and an optional TabCloseGuard for dirty-tab close protection (previously stored only in shellContent)
- **FR-003**: A new `registerTab` action MUST add a tab to the workspace state without making it active or visible
- **FR-004**: The existing `openTab` action MUST activate and display a tab that is already registered in the workspace state
- **FR-005**: A `registerAndOpenTab` facade action MUST dispatch `registerTab` followed by `openTab` to register and immediately display a tab
- **FR-006**: ShellManager.addTab() MUST dispatch `registerAndOpenTab` to register and open a tab
- **FR-007**: ShellComponent MUST source all tab-related observables (tab list, active tab ID, active component type, close guards) exclusively from workspace selectors
- **FR-008**: The workspace selectors MUST provide: a flat list of TabItem[] for the primary tab group, the active tab ID for the primary group, the component type of the active tab (derived from the active TabItem's componentType property), and a Record<tabId, TabCloseGuard> derived from each tab's closeGuard property
- **FR-009**: Tab close operations (via TabBarComponent) MUST operate on the workspace slice and correctly find and remove tabs
- **FR-010**: Tab selection operations MUST update the active tab in the workspace slice
- **FR-011**: The AppState interface MUST no longer include the shellContent slice
- **FR-012**: All existing tests for shellContent (reducer and selectors) MUST be migrated or replaced with equivalent workspace tests
- **FR-013**: All existing tests that import from shellContent MUST be updated to import from workspace
- **FR-014**: The TabItem model MUST be extended to include optional `componentType` (Angular Type<unknown>) and `closeGuard` (TabCloseGuard) properties directly on each tab instance

### Key Entities

- **Workspace Tab**: A tab within the workspace, identified by a unique ID, with properties: label, icon, dirty flag, closable flag, pinned flag, groupId, optional `componentType` (Angular Type<unknown>) for dynamic rendering, and optional `closeGuard` (TabCloseGuard) for dirty-tab protection. These two metadata fields are direct properties of the TabItem model.
- **Tab Group**: A collection of workspace tabs with a shared groupId, an active tab ID, and a dock zone assignment. The primary tab group (groupId: 'main') is the one rendered in the shell's central tab bar.
- **TabCloseGuard**: An optional interface with a `beforeClose()` method that returns a boolean or Promise<boolean>, used to prevent closing dirty tabs without user confirmation.
- **registerTab action**: Adds a tab to the workspace state (with componentType and closeGuard) without making it active or visible.
- **openTab action**: Activates and displays a tab that is already registered in the workspace state. If the tab is already open, it only activates it.
- **registerAndOpenTab facade**: A convenience action that dispatches `registerTab` followed by `openTab` to register and immediately display a tab in a single call.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All tabs registered via ShellManager.addTab() are visible in the tab bar and closable via the tab bar's close button within a single release cycle
- **SC-002**: Zero imports of shellContent (actions, reducers, selectors) remain in the codebase after the refactor
- **SC-003**: All existing unit tests pass after the refactor with no test failures related to tab management
- **SC-004**: Tab close operations complete successfully (tab removed, adjacent tab activated) in 100% of test scenarios covering: close non-active tab, close active tab, close last tab, close pinned tab (blocked), close dirty tab with guard allowing, close dirty tab with guard denying
- **SC-005**: The workspace slice handles at least 10 concurrent tabs without performance degradation observable to the user (tab switch < 120 ms)

## Assumptions

- The primary tab group uses groupId 'main' consistently across the codebase
- Component types (Type<unknown>) stored in NgRx state are acceptable despite NgRx immutability checks (the app already disables strictStateImmutability for this reason)
- The sidebar, toolbar, bottom panel, and secondary panel registration flows (addSidebarEntry, addToolbarAction, addBottomPanelEntry, addSecondaryPanelEntry) remain in a separate slice or are migrated in a future refactor — this feature focuses only on central tab management
- The mock content initializer (registerMockContent) will continue to work without changes to its public API (ShellManager.addTab signature remains the same)
- The existing `openTab` action is repurposed to open (activate/display) a tab that is already registered; it no longer creates new groups from unregistered tabs
- No runtime data migration is needed since tabs are ephemeral (in-memory only, not persisted)
