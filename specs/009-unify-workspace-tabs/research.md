# Research: Unify Workspace Tab Management

## Decision 1: How to store componentType in TabItem

**Context**: The current `TabItem` model is a plain data interface with no Angular-specific types. The `shellContent` slice stored `Type<unknown>` separately in a `ShellTab` wrapper. We need to decide how to attach component types to tabs in the unified workspace state.

**Decision**: Extend `TabItem` with optional `componentType?: Type<unknown>` and `closeGuard?: TabCloseGuard` properties directly.

**Rationale**:
- Simplest approach: one source of truth per tab, no parallel data structures to keep in sync
- Selectors become trivial — just read from the tab object itself
- The app already disables `strictStateImmutability` in NgRx dev tools specifically because component types are stored in state
- Matches the existing pattern where `SecondaryPanelEntry` already stores `component: Type<unknown>` directly

**Alternatives considered**:
- **Parallel Map**: Store a `Map<tabId, {componentType, closeGuard}>` in `WorkspaceState`. Rejected because it introduces synchronization complexity and makes selectors more complex.
- **Wrapper type**: Create `WorkspaceTab extends TabItem` with extra fields. Rejected because it would require casting or mapping at every selector boundary, adding friction without benefit.

## Decision 2: Action design — registerTab + openTab + registerAndOpenTab

**Context**: The current codebase has `addShellTab` (shellContent, registers for display) and `openTab` (workspace, opens in a group). These are disconnected. We need a unified approach.

**Decision**: Three actions with clear separation of concerns:
- `registerTab`: Adds a tab to the workspace state (with componentType and closeGuard). Does NOT make it active. Creates a new group if the groupId doesn't exist.
- `openTab`: Activates and displays a tab that is already registered. If the tab is already present in its group, only activates it.
- `registerAndOpenTab`: Implemented as a reducer handler that applies registerTab logic then openTab logic sequentially within a single call. No Effect needed.

**Rationale**:
- Clean separation: registration (data entry) vs. activation (display) are logically distinct operations
- `openTab` can be reused for scenarios where a tab was registered but not yet shown (e.g., lazy loading)
- `registerAndOpenTab` provides the convenient one-call API that `ShellManager.addTab()` needs
- Existing `closeTab`, `selectTab`, `reorderTab`, `setTabDirty`, `setTabPinned`, `assignGroupToZone` remain unchanged

**Alternatives considered**:
- **Single action only**: One `registerAndOpenTab` action, eliminate `openTab`. Rejected because it loses the flexibility to register without showing.
- **Modify openTab to accept componentType**: Extend existing `openTab` to carry componentType. Rejected because it conflates registration data with activation intent, making the action's purpose ambiguous.

## Decision 3: How to handle openTab for already-registered tabs

**Context**: The current `openTab` reducer creates a new group if the groupId doesn't exist. After the refactor, `openTab` should only work with already-registered tabs.

**Decision**: Modify `openTab` reducer to:
1. If the tab exists in its group → activate it (existing behavior, keep)
2. If the tab exists in state but not in the target group → add it to the group and activate
3. If the tab does NOT exist in state → no-op (or warn in dev mode)

**Rationale**:
- Prevents accidental creation of groups from unregistered tabs
- Makes the contract clear: `registerTab` must be called first
- `registerAndOpenTab` facade handles the common case where both are needed

## Decision 4: Selector strategy for closeGuards

**Context**: TabBarComponent needs a `Record<string, TabCloseGuard>` input. The close guards are now stored on each TabItem.

**Decision**: Create a selector `selectCloseGuardsForGroup(groupId)` that reduces the tab array into a `Record<tabId, TabCloseGuard>`, filtering out tabs without guards.

**Rationale**:
- Simple and efficient — computed once per state change via NgRx memoization
- Matches the exact shape TabBarComponent expects
- No additional state needed

## Decision 5: Backward compatibility for existing workspace tests

**Context**: The existing `workspace.reducer.spec.ts` tests use `openTab` with tabs that have no `componentType` or `closeGuard`.

**Decision**: Both new properties on `TabItem` are optional. Existing tests continue to work without modification because the properties default to `undefined`. The `makeTab` test helper needs no changes.

**Rationale**:
- Zero breaking changes to existing test behavior
- Gradual adoption — tests for new actions can be added alongside existing ones
