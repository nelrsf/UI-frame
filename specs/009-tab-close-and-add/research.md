# Research: Tab Close and Add

## Decision 1: How to Provide TabCloseGuard to the Tab Bar

**Context**: The `TabBarComponent` already has `@Input() closeGuards: Record<string, TabCloseGuard>` and `onTabClose()` logic that consults guards for dirty tabs. The question was how `ShellComponent` should build this map given that tab components are rendered via `NgComponentOutlet` (which does not expose `ComponentRef`).

**Decision**: Store the guard alongside the component type in the `shellContent` NgRx state.

**Rationale**:
- `NgComponentOutlet` does not expose component instances, so we cannot extract guards from rendered components
- `ShellTab` already stores `componentType: Type<unknown>` alongside `tabItem`; adding `guard?: TabCloseGuard` follows the same pattern
- Domain code provides the guard at registration time via `ShellManager.addTab(tab, guard)`
- A new selector `selectShellCloseGuards` builds the `Record<string, TabCloseGuard>` map from the store
- This is fully consistent with the existing NgRx pattern and requires no imperative registry service

**Alternatives considered**:
- **TabGuardRegistry service**: Rejected because it introduces imperative state management outside NgRx (violates Constitution Principle III) and risks stale entries if components are destroyed without unregistering
- **ComponentRef via ViewContainerRef**: Rejected because the project uses `NgComponentOutlet`, not `ViewContainerRef.createComponent()`

## Decision 2: Modal Implementation Approach

**Context**: The "+" button needs to show a modal listing all registered but unopened tabs. No modal/dialog component exists in the codebase. Angular CDK is not a project dependency.

**Decision**: Implement a simple CSS-based modal as a standalone Angular component, rendered conditionally inside `ShellComponent`.

**Rationale**:
- The modal is a simple list picker — no complex positioning or portal requirements
- Adding `@angular/cdk` for one component violates the "no heavy UI frameworks" constraint
- All CSS custom properties for backdrop, overlay, shadows, and transitions already exist in the theme system
- Conditional rendering via `@if (showTabAddModal)` meets the 200ms appearance goal

**Alternatives considered**:
- **Angular CDK Overlay**: Rejected — new dependency, overkill for a simple list picker
- **Angular Material Dialog**: Rejected — heavy UI framework, violates constitution constraint

## Decision 3: Available Tabs Computation for Modal

**Context**: The modal should show only tabs that are registered but not currently open.

**Decision**: Compute available tabs as the difference between registered tabs (`shellContent` state) and open tabs (`workspace` state for group "main").

**Rationale**:
- Both data sources already exist in NgRx stores
- A derived observable or combined selector can compute the difference reactively
- Snapshot at modal open time is acceptable per the spec's edge case guidance

## Decision 4: Close Flow Wiring

**Context**: `TabBarComponent` emits `tabClosed` but `ShellComponent` does not listen to it. The `closeTab` NgRx action already exists.

**Decision**: Wire `tabClosed` output to `ShellComponent.onShellTabClosed()` which dispatches `closeTab({ tabId, groupId })`.

**Rationale**:
- The `closeTab` action and reducer already exist and handle tab removal correctly
- This is a simple output binding — no new state logic needed
- Follows the established pattern: child emits @Output → parent decides to dispatch NgRx Action
