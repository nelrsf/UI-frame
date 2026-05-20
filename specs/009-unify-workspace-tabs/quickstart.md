# Quickstart: Unify Workspace Tab Management

## For Developers Implementing This Refactor

### Prerequisites

- Familiarity with the existing codebase: `shellContent` slice, `workspace` slice, `ShellManager`, `ShellComponent`
- NgRx fundamentals: Actions, Reducers, Selectors, Effects
- Angular standalone components and `NgComponentOutlet`

### Step-by-Step Implementation Order

1. **Extend TabItem model** (`tab-item.model.ts`)
   - Add `componentType?: Type<unknown>` and `closeGuard?: TabCloseGuard`
   - No breaking changes — both are optional

2. **Add new workspace actions** (`workspace.actions.ts`)
   - Add `registerTab` action (props: `{ tab: TabItem }`)
   - Add `registerAndOpenTab` action (props: `{ tab: TabItem }`)
   - Modify `openTab` to only work with already-registered tabs

3. **Update workspace reducer** (`workspace.reducer.ts`)
   - Add handler for `registerTab`
   - Add handler for `registerAndOpenTab` (or use an Effect)
   - Modify `openTab` handler to check registration before creating groups

4. **Add new workspace selectors** (`workspace.selectors.ts`)
   - `selectShellTabs(groupId)` → `TabItem[]`
   - `selectActiveShellTabId(groupId)` → `string | null`
   - `selectActiveShellComponentType(groupId)` → `Type<unknown> | null`
   - `selectCloseGuardsForGroup(groupId)` → `Record<string, TabCloseGuard>`
   - `selectActiveShellTab(groupId)` → `TabItem | null`

5. **Update ShellManager** (`shell-manager.service.ts`)
   - Change `addTab()` to dispatch `registerAndOpenTab` instead of `addShellTab`
   - Remove import of `addShellTab` from shellContent

6. **Update ShellComponent** (`shell.component.ts`)
   - Change all tab-related selector imports from `shellContent` to `workspace`
   - Remove imports: `selectShellTabs`, `selectActiveShellTabId`, `selectActiveShellComponentType`, `setActiveShellTab`
   - Add imports: `selectShellTabs`, `selectActiveShellTabId`, `selectActiveShellComponentType` from workspace
   - Update `onShellTabSelected` to dispatch workspace action (or keep `setActiveShellTab` if migrated)

7. **Update app.config.ts**
   - Remove `provideState('shellContent', shellContentReducer)`
   - Remove import of `shellContentReducer`

8. **Update AppState** (`app.state.ts`)
   - Remove `ShellContentState` import and `shellContent` property

9. **Delete shellContent directory**
   - Remove entire `src/app/core/state/shell-content/` directory

10. **Update tests**
    - Migrate `shell-content.reducer.spec.ts` tests to `workspace.reducer.spec.ts`
    - Migrate `shell-content.selectors.spec.ts` tests to `workspace.selectors.spec.ts`
    - Update `shell-manager.service.spec.ts` to expect `registerAndOpenTab`
    - Run full test suite

### Verification

```bash
# Run all tests
ng test

# Verify no shellContent imports remain
rg "shell-content" src/
rg "shellContent" src/

# Verify build succeeds
ng build
```

### Key Files Changed

| File | Change Type | Lines Impact |
|------|-------------|-------------|
| `tab-item.model.ts` | MODIFIED | +2 properties |
| `workspace.actions.ts` | MODIFIED | +2 actions |
| `workspace.reducer.ts` | MODIFIED | +2 handlers, 1 modified |
| `workspace.selectors.ts` | MODIFIED | +5 selectors |
| `workspace.reducer.spec.ts` | MODIFIED | +new test blocks |
| `shell-manager.service.ts` | MODIFIED | ~5 lines changed |
| `shell-manager.service.spec.ts` | MODIFIED | ~10 lines changed |
| `shell.component.ts` | MODIFIED | ~15 lines changed |
| `app.state.ts` | MODIFIED | -1 property |
| `app.config.ts` | MODIFIED | -2 lines |
| `shell-content/*` | DELETED | ~6 files |
