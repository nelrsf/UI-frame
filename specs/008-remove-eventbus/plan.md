# Implementation Plan: Remove EventBus and Consolidate Reactive Architecture

**Branch**: `008-remove-eventbus` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-remove-eventbus/spec.md`

## Summary

This is an architectural refactoring that eliminates the `EventBusService` pub/sub system from the UI Frame application. All 11 event types currently emitted via EventBus are redundant with existing NgRx Actions, Angular Outputs, or the CommandRegistry. The migration follows a phased approach: (1) remove all `eventBus.emit()` calls from production components, (2) migrate CommandRegistry telemetry to NgRx Action + Selector, (3) delete EventBusService, its type definitions, and all associated test files. No user-facing behavior changes.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19.x, RxJS 7.x, NgRx 19.x  
**Primary Dependencies**: @ngrx/store, @ngrx/effects, Angular standalone components, Electron (IPC layer)  
**Storage**: N/A (no new persistence; existing workspace session storage unchanged)  
**Testing**: Jasmine + Karma (existing unit test suite)  
**Target Platform**: Windows/macOS/Linux desktop via Electron  
**Project Type**: Desktop application (Electron + Angular shell)  
**Performance Goals**: No regression in shell interaction latency (sidebar toggle, tab switch, panel resize)  
**Constraints**: Zero user-facing behavior changes; each migration phase must compile and pass tests independently  
**Scale/Scope**: 6 production files + 6 test files modified; 1 new NgRx Action + Selector pair; 1 service + 1 model file deleted

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Official Stack and Layer Boundaries | PASS | No new layers introduced. EventBus removal simplifies existing boundaries. |
| II. Shell-First UX Contract | PASS | No shell behavior changes. All layout/state flows through existing NgRx slices. |
| III. Single Reactive Paradigm (NgRx) | PASS (enforced) | This refactoring *implements* Principle III. EventBus removal eliminates the duplicate reactive paradigm. Command telemetry moves to NgRx. |
| IV. Security and Least Privilege | PASS | No IPC or Electron boundary changes. |
| V. Quality Gates and Traceability | PASS | All 14 FRs have measurable acceptance criteria. Test coverage maintained. |
| Reactive Architecture Contract | PASS (enforced) | NgRx handles state/events, Angular Outputs handle parent-child, CommandRegistry handles orchestration. No pub/sub remains. |

**Gate Result**: All principles pass. This refactoring is constitutionally aligned and in fact *enforces* Principle III.

## Project Structure

### Documentation (this feature)

```text
specs/008-remove-eventbus/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for internal refactoring)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── services/
│   │   ├── event-bus.service.ts          [DELETE]
│   │   ├── event-bus.service.spec.ts     [DELETE]
│   │   ├── command-registry.service.ts   [MODIFY - remove EventBus dep, add Store]
│   │   └── command-registry.service.spec.ts [MODIFY - use store.select() for telemetry]
│   ├── models/
│   │   └── app-event.model.ts            [DELETE or REDUCE to empty]
│   └── state/
│       ├── layout/
│       │   ├── layout.actions.ts         [NO CHANGE - already has needed actions]
│       │   └── layout.selectors.ts       [NO CHANGE]
│       ├── session/
│       │   └── session.actions.ts        [NO CHANGE - shellReady exists]
│       └── command-telemetry/            [NEW - Phase 2]
│           ├── command-telemetry.actions.ts
│           ├── command-telemetry.reducer.ts
│           ├── command-telemetry.selectors.ts
│           └── index.ts
├── shell/
│   ├── shell.component.ts                [MODIFY - remove all eventBus.emit() calls]
│   ├── shell.component.spec.ts           [MODIFY - remove EventBus assertions]
│   └── components/
│       ├── sidebar/
│       │   ├── sidebar.component.ts      [MODIFY - remove eventBus.emit() calls]
│       │   └── sidebar.component.spec.ts [MODIFY - remove EventBus assertions]
│       ├── bottom-panel/
│       │   ├── bottom-panel.component.ts      [MODIFY - remove eventBus.emit() calls]
│       │   └── bottom-panel.component.spec.ts [MODIFY - remove EventBus assertions]
│       └── tab-bar/
│           ├── tab-bar.component.ts      [MODIFY - remove eventBus.emit() calls]
│           └── tab-bar.component.spec.ts [MODIFY - remove EventBus assertions]
```

**Structure Decision**: Single project (Angular monolith). No new projects or packages. The only new directory is `core/state/command-telemetry/` for the NgRx telemetry slice. All other changes are modifications or deletions within existing files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This refactoring reduces complexity by eliminating a redundant reactive paradigm.

## Research Notes

### EventBus Event Inventory

| Event Name | Emitted By | NgRx Equivalent | Angular Output Equivalent | Classification |
|-----------|-----------|-----------------|--------------------------|----------------|
| `shell.ready.v1` | ShellComponent | `shellReady` action (already dispatched) | N/A | Redundant with NgRx |
| `shell.layout.changed.v1` | ShellComponent (4 calls) | `toggleSidebar`, `toggleBottomPanel`, `toggleSecondaryPanel` (already dispatched) | N/A | Redundant with NgRx |
| `sidebar.collapsed.v1` | SidebarComponent | `toggleSidebar` / `setSidebarVisible` (already dispatched) | `collapsedChange` | Redundant with both |
| `sidebar.section.activated.v1` | SidebarComponent | `setActiveSidebarItem` (already dispatched) | `activeItemChange` | Redundant with both |
| `bottomPanel.toggled.v1` | BottomPanelComponent | `toggleBottomPanel` (already dispatched) | `visibilityChange` | Redundant with both |
| `bottomPanel.resized.v1` | ShellComponent | `setBottomPanelHeight` (already dispatched) | N/A | Redundant with NgRx |
| `tabs.active.changed.v1` | TabBarComponent | `setActiveShellTab` (already dispatched) | `tabSelected` | Redundant with both |
| `shell.region.resized.v1` | ShellComponent (2 calls) | `setBottomPanelHeight`, `setSecondaryPanelWidth` (already dispatched) | N/A | Redundant with NgRx |
| `command.executed.v1` | CommandRegistryService | None (cross-cutting telemetry) | N/A | Cross-cutting → NgRx Action |
| `sidebar.resized.v1` | AppEventName type | `setSidebarWidth` (already exists) | N/A | Redundant with NgRx (no emitters found) |
| `tabs.reordered.v1` | AppEventName type | None yet | `tabReordered` Output (reserved) | Dead code (no emitters) |

### Runtime Subscriber Analysis

Static analysis (grep) confirms:
- **Zero production subscribers** to any EventBus event.
- **Only test subscribers**: `command-registry.service.spec.ts` subscribes to `command.executed.v1` in 6 test cases.
- All other events are "fire and forget" — emitted but never consumed.

### Migration Strategy (Phased)

**Phase 1**: Remove `eventBus.emit()` from components (ShellComponent, SidebarComponent, BottomPanelComponent, TabBarComponent). No functional changes — Actions and Outputs already handle the same semantics.

**Phase 2**: Migrate CommandRegistryService — inject Store, dispatch `commandExecuted` action, create telemetry reducer + selector. Update tests to use `store.select()`.

**Phase 3**: Delete EventBusService, `app-event.model.ts`, and all references. Verify build and tests pass.

## Data Model

### New NgRx Slice: Command Telemetry

```typescript
interface CommandTelemetryState {
  readonly executions: CommandExecutionRecord[];
  readonly maxHistory: number; // Cap to prevent unbounded growth
}

interface CommandExecutionRecord {
  readonly commandId: string;
  readonly success: boolean;
  readonly timestamp: number;
  readonly context?: string;
}
```

- `maxHistory` defaults to 100 (configurable). Oldest records evicted on overflow.
- This slice is NOT persisted to workspace sessions (telemetry is transient).
- Selector `selectRecentExecutions(count)` returns the N most recent records.
- Selector `selectLastExecution(commandId)` returns the latest record for a specific command.

### Deleted Types

- `EventBusService` (class)
- `IEventBusService` (interface)
- `AppEventName` (type union) — entire file deleted
- `AppEvent<TName>` (interface) — entire file deleted
- `AppEventPayloads` (interface) — entire file deleted

## Quickstart

### For Developers

1. Pull the branch with this refactoring.
2. Run `ng build` — should compile with zero errors.
3. Run `ng test` — all tests should pass.
4. Launch the app — verify shell behavior is unchanged (sidebar toggle, panel resize, tab selection).
5. Search for `EventBusService` — should find zero results.

### Verification Commands

```bash
# Build
ng build

# Test
ng test --no-watch --browsers=ChromeHeadless

# Verify no EventBus references remain
rg "EventBusService|event-bus|eventBus" src/
# Expected: no results
```

## Contracts

N/A — this is an internal refactoring with no external API changes. No contracts directory needed.
