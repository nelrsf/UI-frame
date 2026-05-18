# Research: Remove EventBus and Consolidate Reactive Architecture

**Date**: 2026-05-18
**Feature**: 008-remove-eventbus

## Decision 1: Command Telemetry Mechanism

**Decision**: Use NgRx Action + Selector for command execution telemetry.

**Rationale**: 
- Aligns with Constitution Principle III (Single Reactive Paradigm).
- Tests can use `store.select()` instead of `eventBus.on()`.
- Effects can react to telemetry events if future needs arise (remote logging, analytics).
- No new abstractions introduced.

**Alternatives considered**:
- RxJS Subject in CommandRegistry — simpler but violates Principle III by creating a second reactive stream outside NgRx.
- Dedicated `CommandTelemetryService` — isolates concern but adds a service layer where NgRx already handles it.
- Remove telemetry entirely — loses debugging capability; tests would need rewriting to use console spies.

## Decision 2: Resize Metadata Disposition

**Decision**: Discard resize metadata (source, committedAt) from NgRx state. Only dimension values persist.

**Rationale**:
- Metadata is not consumed by any production code.
- Adding it to the layout reducer increases state complexity for zero current benefit.
- If future auditing is needed, a separate telemetry Action can be created (same pattern as command execution).

**Alternatives considered**:
- Store metadata in layout state — adds fields that are never read.
- Create `regionResizeLogged` telemetry action — premature optimization; no current consumer.

## Decision 3: Migration Phasing

**Decision**: Three-phase approach: (1) remove emits from components, (2) migrate CommandRegistry telemetry, (3) delete service + models + tests.

**Rationale**:
- Each phase compiles and passes tests independently.
- Enables safe rollback at any phase boundary.
- Phase 1 is the largest surface area but lowest risk (just deleting redundant calls).
- Phase 2 introduces the only new code (telemetry slice).
- Phase 3 is pure cleanup.

**Alternatives considered**:
- Big bang single commit — faster but higher regression risk.
- Feature flag approach — overkill for a removal; adds dead code during transition.

## Decision 4: app-event.model.ts Disposition

**Decision**: Delete the entire `app-event.model.ts` file.

**Rationale**:
- All event types are either migrated to NgRx or deleted.
- `DockRegionId` type is defined elsewhere (used by workspace session model).
- The file's only purpose was EventBus typing; with EventBus gone, it serves no function.

**Alternatives considered**:
- Keep file with only `DockRegionId` — but `DockRegionId` is already exported from the workspace session model.

## Decision 5: Telemetry State Bounded History

**Decision**: Command telemetry state caps at 100 records (oldest evicted on overflow).

**Rationale**:
- Prevents unbounded memory growth in the NgRx store.
- 100 records is sufficient for debugging recent command execution issues.
- Telemetry is transient — not persisted to workspace sessions.

**Alternatives considered**:
- Unbounded history — memory leak risk over long sessions.
- No telemetry state at all (fire-and-forget action) — tests can't verify telemetry without a selector.
