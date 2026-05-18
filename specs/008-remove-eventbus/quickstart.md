# Quickstart: Remove EventBus and Consolidate Reactive Architecture

**Date**: 2026-05-18
**Feature**: 008-remove-eventbus

## Overview

This refactoring removes the `EventBusService` pub/sub system and consolidates all reactive communication around NgRx Actions, Angular Outputs, and CommandRegistry. No user-facing behavior changes.

## What Changes

### Removed
- `EventBusService` — pub/sub event bus service
- `app-event.model.ts` — event type definitions
- All `eventBus.emit()` calls across 6 components/services

### Added
- `core/state/command-telemetry/` — new NgRx slice for command execution telemetry
  - `command-telemetry.actions.ts` — `commandExecuted` action
  - `command-telemetry.reducer.ts` — bounded history reducer
  - `command-telemetry.selectors.ts` — `selectRecentExecutions`, `selectLastExecution`
  - `index.ts` — barrel export

### Modified
- `core/services/command-registry.service.ts` — injects Store, dispatches `commandExecuted` action
- `shell/shell.component.ts` — removes 8 `eventBus.emit()` calls
- `shell/components/sidebar/sidebar.component.ts` — removes 3 `eventBus.emit()` calls
- `shell/components/bottom-panel/bottom-panel.component.ts` — removes 2 `eventBus.emit()` calls
- `shell/components/tab-bar/tab-bar.component.ts` — removes 1 `eventBus.emit()` call
- All corresponding `.spec.ts` files — replace EventBus assertions with NgRx/Output assertions

## Verification

```bash
# 1. Build should succeed with zero errors
ng build

# 2. All tests should pass
ng test --no-watch --browsers=ChromeHeadless

# 3. No EventBus references should remain
rg "EventBusService|event-bus|eventBus" src/
# Expected: no results

# 4. Manual smoke test: launch app and verify
#    - Sidebar toggle works
#    - Bottom panel toggle/resize works
#    - Secondary panel toggle/resize works
#    - Tab selection works
#    - Native menu commands work (Panel inferior, Panel secundario)
```

## Migration Phases

### Phase 1: Remove emits from components
Delete `eventBus.emit()` calls from ShellComponent, SidebarComponent, BottomPanelComponent, TabBarComponent. No new code added. Build and tests pass.

### Phase 2: Migrate CommandRegistry telemetry
Create `command-telemetry` NgRx slice. Update CommandRegistryService to inject Store and dispatch `commandExecuted` action. Update tests to use `store.select()`.

### Phase 3: Delete EventBus infrastructure
Remove `event-bus.service.ts`, `event-bus.service.spec.ts`, `app-event.model.ts`. Remove all remaining EventBus imports. Final build and test verification.

## Rollback

If any phase introduces regressions:
1. Revert the phase's commit.
2. The previous phase's state is stable (compiles + tests pass).
3. No database or persisted state changes — rollback is purely code-level.
