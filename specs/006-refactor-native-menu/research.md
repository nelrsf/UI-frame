# Research: Native Menu Refactoring

**Date**: 2026-05-17 | **Branch**: 006-refactor-native-menu

## Research Tasks

### Task 1: Menu Extension Configuration Point (FR-008)
**Question**: What should be the naming for the stable menu extension configuration point?

**Findings**:
- `IMenuConfig` already exists in `src/contracts/menu.ts` (from spec 005)
- The extension point should be a separate module that exports `IMenuConfig` and default configurations
- Recommended name: `menu.config.ts` or `menu-extension.config.ts` in `src/electron/menu/`

**Decision**: Use `src/electron/menu/menu.config.ts` as the extension point that integrators import
**Rationale**: Follows existing pattern in codebase; clear separation from internal `menu.builder.ts`
**Alternatives considered**:
- `menu-extension.config.ts` - too verbose
- Reusing existing `IMenuConfig` directly - less discoverable for integrators

---

### Task 2: Menu Initializer (FR-010)
**Question**: What should be the naming and responsibility for the menu initializer?

**Findings**:
- Need a module that receives window/runtime context, uses configuration, configures manager, applies menu
- Should encapsulate the current inline logic in `main.ts`:
  - `MenuManager.getInstance().setMainWindow(mainWindow)`
  - `rebuildMenu(true, true)` or equivalent

**Decision**: Create `src/electron/menu/menu.initializer.ts` with a `MenuInitializer` class
**Rationale**: Clear separation of concerns; follows single responsibility principle
**Alternatives considered**:
- Extending MenuManager - violates SRP, manager already handles updates
- Static function in main.ts - defeats refactoring purpose

---

### Task 3: Theme Initializer (FR-004)
**Question**: How should the theme initializer be implemented to be reusable by both preferences handlers and main process bootstrap?

**Findings**:
- Current implementation reads from `preferences.json` directly in `main.ts`
- Should centralize in a module that can be used by both:
  - Main process bootstrap (theme at startup)
  - Preferences handlers (theme changes)

**Decision**: Create `src/electron/theme/theme-initializer.ts` with a `ThemeInitializer` class
**Rationale**: Reusable by any module that needs theme; handles safe defaults for missing/invalid prefs
**Alternatives considered**:
- Using existing preferences.repository - not in main process scope
- Adding theme logic to preferences.handlers - couples theme to preferences

---

### Task 4: Preference Store/Repository for Main Process (FR-003)
**Question**: How to implement a shared persistence module for main process?

**Findings**:
- Currently preferences.json is read directly in main.ts
- Should create a module that handles read/write with envelope schema validation

**Decision**: Create `src/electron/preferences/preference-store.ts` (or `src/electron/preferences/repository.ts`)
**Rationale**: Provides consistent read/write with schema validation; reusable by theme and preferences handlers
**Alternatives considered**:
- Reusing renderer-side repository - different concerns, different location
- Direct fs access in each handler - violates DRY, inconsistent validation

---

### Task 5: Signal/Event Module for Smoke and Accessibility (FR-014)
**Question**: How to isolate smoke/accessibility signals from main.ts?

**Findings**:
- Currently inline in `mainWindow.webContents.on('did-finish-load', ...)` in `createWindow()`
- Should be a separate module that can be invoked by the bootstrap

**Decision**: Create `src/electron/lifecycle/signals.ts` with `emitShellSignals()` function
**Rationale**: Testable independently; clear separation from window creation
**Alternatives considered**:
- Adding to window.handlers - too coupled to window lifecycle
- Separate process - overkill for simple signal emission

---

### Task 6: Shell Handler (FR-007)
**Question**: How to implement the shell handler for OPEN_EXTERNAL?

**Findings**:
- Already implemented inline in main.ts `registerIpcHandlers()`
- Should be moved to a modular handler like window.handlers.ts and preferences.handlers.ts

**Decision**: Create `src/electron/ipc/handlers/shell.handlers.ts`
**Rationale**: Follows existing pattern of modular handlers; allows testing in isolation

---

## Summary

| Unknown | Decision | Status |
|---------|----------|--------|
| Menu extension config | `src/electron/menu/menu.config.ts` | ✅ Resolved |
| Menu initializer | `src/electron/menu/menu.initializer.ts` | ✅ Resolved |
| Theme initializer | `src/electron/theme/theme-initializer.ts` | ✅ Resolved |
| Preference store | `src/electron/preferences/preference-store.ts` | ✅ Resolved |
| Smoke signals | `src/electron/lifecycle/signals.ts` | ✅ Resolved |
| Shell handler | `src/electron/ipc/handlers/shell.handlers.ts` | ✅ Resolved |

All unknowns resolved. Proceeding to Phase 1.