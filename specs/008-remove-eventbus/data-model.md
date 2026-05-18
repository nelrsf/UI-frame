# Data Model: Remove EventBus and Consolidate Reactive Architecture

**Date**: 2026-05-18
**Feature**: 008-remove-eventbus

## New Entities

### CommandExecutionRecord

Represents a single command execution telemetry entry.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `commandId` | `string` | Yes | Unique identifier of the executed command |
| `success` | `boolean` | Yes | Whether execution completed without error |
| `timestamp` | `number` | Yes | Unix timestamp (ms) of execution completion |
| `context` | `string` | No | Optional context string for categorization |

### CommandTelemetryState

NgRx state slice for command execution telemetry.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `executions` | `CommandExecutionRecord[]` | `[]` | Bounded history of command executions |
| `maxHistory` | `number` | `100` | Maximum records retained before eviction |

### CommandTelemetryAction

NgRx Action dispatched on every command execution.

```typescript
export const commandExecuted = createAction(
  '[Command Telemetry] Executed',
  props<{ commandId: string; success: boolean; timestamp: number; context?: string }>()
);
```

## Deleted Entities

| Entity | File | Reason |
|--------|------|--------|
| `EventBusService` | `core/services/event-bus.service.ts` | Redundant pub/sub system |
| `IEventBusService` | `core/services/event-bus.service.ts` | Interface for deleted service |
| `AppEventName` | `core/models/app-event.model.ts` | Event type union — no longer needed |
| `AppEvent<TName>` | `core/models/app-event.model.ts` | Generic event envelope — no longer needed |
| `AppEventPayloads` | `core/models/app-event.model.ts` | Payload type map — no longer needed |
| `ChannelListener` | `core/services/event-bus.service.ts` | Internal EventBus type |
| `PartialObserver` | `core/services/event-bus.service.ts` | Internal EventBus type |

## State Transitions

No new state transitions. Existing NgRx slices (layout, shell-content, session, preferences, ui-context, workspace) remain unchanged. The command telemetry slice is append-only with bounded eviction.

## Validation Rules

- `commandId` must be non-empty string.
- `timestamp` must be a positive integer (Unix ms).
- `executions` array must not exceed `maxHistory` length.
- On overflow, oldest record is removed (FIFO eviction).

## Relationships

```
CommandRegistryService
  └── dispatches → commandExecuted Action
       └── handled by → CommandTelemetry Reducer
            └── produces → CommandTelemetryState
                 └── read by → CommandTelemetry Selectors
                      └── consumed by → Tests (store.select()), Future Effects
```

No other component or service depends on the command telemetry slice.
