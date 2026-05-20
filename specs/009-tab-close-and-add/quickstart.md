# Quickstart: Tab Close and Add

## What This Feature Does

1. **Close tabs**: Clicking the (x) button on a closable tab closes it. For dirty tabs, the registered `TabCloseGuard.beforeClose()` is consulted — returning `false` cancels the close.
2. **Add tabs**: Clicking the "+" button opens a modal listing all registered but unopened tabs. Selecting one opens it in the workspace.

## Files Changed

| File | Change |
|---|---|
| `shell-content.reducer.ts` | Add `guard?: TabCloseGuard` to `ShellTab` interface |
| `shell-content.actions.ts` | Add optional `guard` parameter to `addShellTab` action |
| `shell-content.selectors.ts` | Add `selectShellCloseGuards` selector |
| `shell-manager.service.ts` | Add optional `guard` parameter to `addTab()` method |
| `shell.component.ts` | Add `closeGuards$` observable, `showTabAddModal` flag, `onShellTabClosed()`, `onNewTabRequested()`, `onTabAddModalSelected()`, `onTabAddModalDismissed()` handlers |
| `shell.component.html` | Bind `(tabClosed)`, `(newTabRequested)`, `[closeGuards]`, and conditionally render `<app-tab-add-modal>` |
| `tab-add-modal.component.ts` | **NEW** — Modal component with `@Input() availableTabs`, `@Output() tabSelected`, `@Output() dismissed` |
| `tab-add-modal.component.html` | **NEW** — Modal template with backdrop, tab list, and empty state |
| `tab-add-modal.component.css` | **NEW** — BEM-styled modal using existing CSS custom properties |
| `tab-add-modal.component.spec.ts` | **NEW** — Unit tests for modal component |
| `tab-bar.component.spec.ts` | Update — Add tests for close/add flows |

## Build and Test

```powershell
# Build
npm run build

# Run all tests
npm test

# Run specific test file
npm test -- --include="**/tab-add-modal.component.spec.ts"
npm test -- --include="**/tab-bar.component.spec.ts"
```

## Manual Verification

1. Start the app: `npm start`
2. **Close test**: Register a tab with `closable: true`, mark it dirty, register a guard that returns `false`. Click close — tab should stay open.
3. **Add test**: Close all tabs. Click "+" — modal should appear with registered tabs. Click one — it should open.
4. **Empty modal test**: Open all registered tabs. Click "+" — modal should show "No additional tabs available to open."
