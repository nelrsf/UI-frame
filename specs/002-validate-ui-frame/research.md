# Research: UI Frame Shell OCP — ShellManager & Region Contracts

**Feature**: 002-validate-ui-frame  
**Phase**: 0 — Research  
**Date**: 2026-05-04

---

## Decision 1: State slice strategy for ShellManager-registered content

**Decision**: Introduce a new dedicated NgRx slice `shellContent` in `src/app/core/state/shell-content/` to hold sidebar items, toolbar actions, bottom panel tabs, and the active tab component type.

**Rationale**: Existing slices serve distinct purposes:
- `workspace` manages tab *metadata* (dirty, pinned, groupId, order) — extending it with `Type<unknown>` references conflates structural shell concerns with dynamic content registration.
- `uiContext` manages breadcrumbs, status bar items, and available action IDs — toolbar action *objects* are architecturally different from command ID strings.
- Creating a dedicated `shellContent` slice cleanly separates "content registered by domain code via ShellManager" from "transversal shell state driven by user interaction."

**Alternatives considered**:
- Extend `workspace` for tabs + `uiContext` for sidebar/toolbar/panel: Rejected because it scatters ShellManager-owned state across two unrelated slices, making the feature harder to isolate, test, and later remove.
- Store all data in ShellManager service using BehaviorSubjects without NgRx: Rejected per spec clarification Q1 (NgRx actions are the required integration mechanism).

---

## Decision 2: `Type<unknown>` in NgRx state

**Decision**: The `shellContent` slice stores `componentType: Type<unknown>` alongside each tab's metadata. The store does NOT enable `runtimeChecks.strictStateSerializability`; the default configuration already allows non-serializable values.

**Rationale**: Angular's `Type<unknown>` is a class constructor reference. Storing it in NgRx state is non-standard but functional when serialization checks are off (the project's `app.config.ts` does not enable strict runtime checks). This is acceptable for this feature because:
1. Shell content is in-memory only (spec FR-008, Assumptions).
2. No devtools time-travel or state hydration is needed for mock content.
3. The alternative (a side-channel `Map<id, Type>` in ShellManager) effectively duplicates state management.

**Alternatives considered**:
- Side-channel `componentRegistry: Map<string, Type<unknown>>` in ShellManager (not in store): Technically cleaner for serialization but creates two sources of truth that must stay in sync. Rejected for this feature scope.
- Router-based lazy loading: Rejected per spec clarification Q2 (NgComponentOutlet chosen).

---

## Decision 3: `NgComponentOutlet` placement and wiring

**Decision**: `ContentAreaComponent` is extended to accept `componentType: Type<unknown> | null` as an additional `@Input()`. The template uses `[ngComponentOutlet]` to render the active tab's component dynamically. `ShellComponent` selects `activeComponentType$` from the `shellContent` slice and passes it down.

**Rationale**: `ContentAreaComponent.html` already has a placeholder comment: "Active view content will be rendered here via tab wiring". The component accepts `@Input() activeTab: TabItem | null` which drives the empty-state logic; adding `componentType` alongside it is a minimal, backward-compatible change.

**FR-007 compliance**: `ContentAreaComponent` only references `Type<unknown>` from `@angular/core` — not any domain or mock class. The concrete type is resolved at runtime from the store, not at compile time.

---

## Decision 4: CommandRegistry integration for `IToolbarAction`

**Decision**: When `ShellManager.addToolbarAction(action: IToolbarAction)` is called, ShellManager:
1. Calls `commandRegistry.register({ id: 'shell.action.' + action.id, execute: action.handler })`.
2. Dispatches a `shellContent` action to add a `ToolbarAction` DTO with `commandId = 'shell.action.' + action.id`.

**Rationale**: `ToolbarComponent` already calls `commandRegistry.execute(action.commandId)` on click. This path requires zero modification to `ToolbarComponent`. `CommandRegistryService.register()` accepts `{ id: string; execute: () => void | Promise<void> }` which maps directly to `IToolbarAction.handler`.

**Exception handling**: `CommandRegistryService.execute()` already wraps handlers in try/catch and emits a `command.executed.v1` event on failure — the spec edge case ("handler throws, shell does not collapse") is satisfied for free.

---

## Decision 5: `ShellComponent` template wiring

**Decision**: `ShellComponent` is updated to:
1. Select `sidebarItems$`, `toolbarActions$`, `activeTab$`, `activeComponentType$`, and `bottomPanelTabs$` from the store.
2. Pass `[items]` to `SidebarComponent`, `[actions]` to `ToolbarComponent`, and `[componentType]` + `[activeTab]` to `ContentAreaComponent`.
3. Wire `TabBarComponent` with the primary workspace tab group (tabs + activeTabId).
4. Wire `BottomPanelComponent` with the registered panel tabs.

**FR-007 compliance**: All inputs use only existing shell DTOs (`SidebarItem`, `ToolbarAction`, `TabItem`, `PanelTab`, `Type<unknown>`). No domain or mock type is referenced in `ShellComponent`.

**Rationale**: `ShellComponent` currently passes zero data to most child components. Wiring selectors is the necessary step to make ShellManager's dispatched data visible. This completes the shell, not modifies it for a specific domain.

---

## Decision 6: `APP_INITIALIZER` bootstrap location

**Decision**: `app.config.ts` receives a new `APP_INITIALIZER` provider that injects `ShellManager` and calls `registerMockContent(shellManager)` — a standalone function in `src/app/shell/mock-ui/mock-content.initializer.ts` that registers all mocks.

**Rationale**: Keeps `app.config.ts` minimal (just wires the initializer) and `AppComponent` clean (no new injections). The initializer function is easily replaceable: a real app swaps `registerMockContent` for its own domain registration function.

---

## Decision 7: Duplicate ID policy

**Decision**: `ShellManager` checks for duplicate IDs before dispatching. If an entry with the same `id` already exists, the call is silently ignored with a `console.warn` in development.

**Rationale**: Spec edge case — "ShellManager MUST ignore the second request or throw a configuration error." Silent ignore + warn is safer at bootstrap time (initializers can be called multiple times in test setups).

---

## Summary of research gaps resolved

| Gap | Resolution |
|-----|-----------|
| Which slice holds sidebar/toolbar/panel state | New `shellContent` NgRx slice |
| Can `Type<unknown>` go in NgRx store | Yes, with no strict serialization checks (project default) |
| Where does `NgComponentOutlet` live | In `ContentAreaComponent`, behind new `componentType` input |
| How does handler reach `ToolbarComponent` | Via `CommandRegistry.register()` + `commandId` in ToolbarAction DTO |
| Does `ShellComponent` need to change | Yes — wiring selectors to inputs (not coupling to domain types) |
| Where are mocks registered at bootstrap | `APP_INITIALIZER` in `app.config.ts` via dedicated initializer function |
| Duplicate ID policy | Silent ignore + console.warn |
