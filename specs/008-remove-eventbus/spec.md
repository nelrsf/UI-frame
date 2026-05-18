# Feature Specification: Remove EventBus and Consolidate Reactive Architecture

**Feature Branch**: `[008-remove-eventbus]`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: Refactorización arquitectónica para eliminar el EventBusService de la aplicación y consolidar la arquitectura reactiva alrededor de NgRx, Angular Outputs y CommandRegistry.

## Clarifications

### Session 2026-05-18

- Q: ¿Qué mecanismo reemplaza a `command.executed.v1` para telemetría? → A: NgRx Action (`commandExecuted`) + Selector dedicado. Los tests usan `store.select()` en lugar de `eventBus.on()`.
- Q: ¿Cómo se debe ejecutar la eliminación del EventBus? → A: Phased removal: (1) eliminar todos los `emit()` reemplazándolos con Actions/Outputs, (2) migrar CommandRegistry a NgRx telemetry, (3) eliminar EventBusService + modelos + tests.
- Q: ¿Se preservan los metadatos de resize (source, committedAt) en NgRx? → A: No. NgRx solo almacena dimensiones. Metadatos se descartan.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eliminate EventBusService and migrate shell/layout events to NgRx (Priority: P1)

As a developer maintaining the UI Frame shell, I need the EventBusService removed so that all UI/layout/shell state changes flow through a single reactive paradigm (NgRx), eliminating redundant event channels and reducing architectural complexity.

**Why this priority**: The EventBus currently duplicates every NgRx Action related to layout and shell state. Removing it is foundational — all other cleanup depends on this migration being complete.

**Independent Test**: After migration, the application behaves identically from a user perspective: sidebar toggle, bottom panel toggle/resize, secondary panel toggle/resize, tab selection, and sidebar section activation all work exactly as before. The EventBusService is no longer imported or injected anywhere in production code.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** a user toggles the sidebar, **Then** the layout state updates via NgRx Action only (no EventBus emit)
2. **Given** the app is running, **When** a user resizes the bottom panel, **Then** the layout state updates via NgRx Action only (no EventBus emit)
3. **Given** the app is running, **When** a user selects a tab, **Then** the shell-content state updates via NgRx Action only (no EventBus emit)
4. **Given** the app is running, **When** the shell initializes, **Then** shell-ready state is recorded via NgRx Action only (no EventBus emit)
5. **Given** the codebase after migration, **When** searching for `EventBusService` imports, **Then** zero production files reference it (only test files may reference it during transition)

---

### User Story 2 - Migrate command execution telemetry to an idiomatic mechanism (Priority: P2)

As a developer debugging command execution, I need command execution telemetry (success/failure/timestamp) to be observable through NgRx or an equivalent mechanism so that auditing, tracing, and cross-cutting concerns remain supported without depending on EventBus.

**Why this priority**: `command.executed.v1` is the ONLY EventBus event with real subscribers (in tests). It represents a cross-cutting concern (auditing/telemetry), not persistent state. This needs a dedicated migration path distinct from simple state events.

**Independent Test**: Command execution telemetry is observable via a dedicated NgRx Action (`commandExecuted`) and Selector. Tests that previously subscribed to `command.executed.v1` on EventBus now subscribe via `store.select()` with equivalent assertions.

**Acceptance Scenarios**:

1. **Given** a command is registered and executed, **When** execution completes (success or failure), **Then** a `commandExecuted` NgRx Action is dispatched with payload (commandId, success, timestamp, context)
2. **Given** the NgRx telemetry is in place, **When** a test subscribes to the command telemetry Selector, **Then** it receives the same data previously available via `command.executed.v1`
3. **Given** a command throws an error, **When** execution fails, **Then** the failure is recorded with `success: false` and does not crash the application

---

### User Story 3 - Clean up EventBusService and associated dead code (Priority: P3)

As a developer, I need the EventBusService, its type definitions, and all associated test files removed from the codebase so that no dead code remains and the build is clean.

**Why this priority**: This is the final cleanup step. It depends on Stories 1 and 2 being complete. The migration follows a phased approach: (1) eliminate all `emit()` calls, (2) migrate CommandRegistry telemetry, (3) remove EventBusService + models + tests. Each phase must compile and pass tests independently.

**Independent Test**: The codebase compiles without errors. No file imports EventBusService. The `app-event.model.ts` event type union no longer includes migrated event names. All tests pass.

**Acceptance Scenarios**:

1. **Given** the cleanup is complete, **When** running `ng build`, **Then** the build succeeds with zero errors
2. **Given** the cleanup is complete, **When** running `ng test`, **Then** all tests pass
3. **Given** the cleanup is complete, **When** searching for `event-bus.service`, **Then** no files are found (service, spec, and model references removed)

---

### Edge Cases

- What happens if a future developer reintroduces a pub/sub EventBus? The constitution explicitly forbids this pattern (Principle III: Single Reactive Paradigm).
- How does the system handle command execution telemetry if the NgRx dispatch fails? It should degrade gracefully (log warning, don't block command execution).
- What if hidden runtime subscribers exist that weren't detected by static analysis? The migration plan must include a runtime verification step before removing the service.
- Resize metadata (source, committedAt) from `shell.region.resized.v1` is intentionally discarded. If future auditing of resize events is needed, a separate telemetry Action should be created following the same pattern as command execution telemetry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove all `eventBus.emit()` calls from ShellComponent, SidebarComponent, BottomPanelComponent, TabBarComponent, and CommandRegistryService
- **FR-002**: System MUST replace `shell.ready.v1` EventBus emission with an equivalent NgRx Action dispatch (shellReady action already exists and is dispatched)
- **FR-003**: System MUST replace `shell.layout.changed.v1` EventBus emissions with existing NgRx Actions (toggleSidebar, toggleBottomPanel, toggleSecondaryPanel already dispatch layout changes)
- **FR-004**: System MUST replace `sidebar.collapsed.v1` and `sidebar.section.activated.v1` EventBus emissions with Angular Outputs (already emitted) + NgRx state (activeSidebarItem, sidebarVisible already in store)
- **FR-005**: System MUST replace `bottomPanel.toggled.v1` EventBus emissions with Angular Outputs (already emitted) + NgRx state (bottomPanelVisible already in store)
- **FR-006**: System MUST replace `bottomPanel.resized.v1` EventBus emissions with NgRx Actions (setBottomPanelHeight already dispatches)
- **FR-007**: System MUST replace `tabs.active.changed.v1` EventBus emissions with Angular Outputs (already emitted) + NgRx state (activeShellTabId already in store)
- **FR-008**: System MUST replace `shell.region.resized.v1` EventBus emissions with existing NgRx Actions (setBottomPanelHeight, setSecondaryPanelWidth already dispatch). Resize metadata (source, committedAt) is discarded; only the dimension value is persisted in NgRx state.
- **FR-009**: System MUST replace `command.executed.v1` telemetry with a dedicated NgRx Action (`commandExecuted`) and Selector. CommandRegistryService dispatches the action on every command execution (success or failure). Tests subscribe via `store.select()` to verify telemetry. The action payload includes commandId, success, timestamp, and optional context.
- **FR-010**: System MUST remove EventBusService from the Angular DI container (remove providedIn: 'root')
- **FR-011**: System MUST remove EventBusService imports from all production and test files
- **FR-012**: System MUST update CommandRegistryService to use the new telemetry mechanism instead of EventBus
- **FR-013**: System MUST update all affected spec files to remove EventBus-related test assertions and replace with equivalent NgRx/Output-based assertions
- **FR-014**: System MUST preserve all existing user-facing behavior (no visual or interaction regressions)

### Key Entities

- **EventBusService**: The pub/sub service being removed. Currently emits 11 distinct event types across 6 components/services.
- **AppEventName**: Type union of event names. Must be updated to remove migrated events or the entire type removed.
- **AppEvent<TName>**: Generic event envelope type. Must be removed along with EventBusService.
- **CommandRegistryService**: Currently depends on EventBus for telemetry. Must be refactored to dispatch `commandExecuted` NgRx Action instead.
- **NgRx Layout Actions**: Already exist (toggleSidebar, setBottomPanelHeight, etc.). Will become the sole source of truth for layout changes. Resize metadata (source, committedAt) is not persisted.
- **NgRx Command Telemetry Action**: New action (`commandExecuted`) with payload { commandId, success, timestamp, context? }. Replaces `command.executed.v1` EventBus event.
- **Angular Outputs**: Already exist on child components (collapsedChange, visibilityChange, tabSelected, etc.). Will become the sole parent-child communication channel for UI events.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero production files import or reference EventBusService after migration
- **SC-002**: All existing unit tests pass after migration (no test coverage regression)
- **SC-003**: Application shell behavior is indistinguishable from pre-migration state (manual smoke test passes)
- **SC-004**: Command execution telemetry remains observable through the new mechanism with equivalent data fidelity
- **SC-005**: Build completes with zero compilation errors and zero new lint warnings
- **SC-006**: No new reactive paradigms are introduced as replacements (no new pub/sub, event emitter, or message bus abstractions)

## Assumptions

- No hidden runtime subscribers to EventBus events exist beyond those found via static analysis (grep confirms only test files subscribe to `command.executed.v1`)
- The NgRx store already captures all state that EventBus events represent (verified: layout state, shell-content state, session state all exist)
- Angular Outputs on child components are sufficient for parent-child communication (verified: all child components already emit appropriate Outputs)
- Electron IPC communication does not depend on EventBus (verified: IPC flows through CommandRegistry and NgRx directly)
- The `app-event.model.ts` file can be safely removed or significantly reduced after migration
- No third-party libraries or external integrations subscribe to EventBus events
- Resize metadata (source, committedAt) is not needed for current or foreseeable future features
- Phased migration is feasible because each phase can compile and pass tests independently
