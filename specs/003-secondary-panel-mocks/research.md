# Research: Secondary Panel Mock Modules (Weather + Market)

**Feature**: 003-secondary-panel-mocks  
**Phase**: 0 - Research  
**Date**: 2026-05-05

## Decision 1: Reuse existing shell-content state for secondary panel entries

- Decision: Extend the existing `shellContent` state and selectors to include secondary panel entry registration and active secondary entry tracking.
- Rationale: The project already centralizes shell composition state in `shellContent` and registration through `ShellManager`; reusing this pattern preserves consistency and reduces integration risk.
- Alternatives considered:
  - Create a new `secondaryPanelContent` NgRx slice: rejected because it duplicates existing shell composition concerns.
  - Keep secondary entries in component-local state: rejected because it breaks centralized shell orchestration and makes fallback behavior harder to enforce.

## Decision 2: Deterministic active-entry lifecycle for secondary panel

- Decision: Apply explicit active-entry rules:
  - First open with both entries available -> default active entry is Weather.
  - If active entry becomes invalid -> fallback automatically to another valid entry.
  - If no valid entries exist -> keep panel visible and render controlled empty state.
- Rationale: This directly satisfies clarified FR-009/FR-010 and yields predictable behavior for tests and manual validation.
- Alternatives considered:
  - Leave active selection undefined on first open: rejected due to nondeterministic UX.
  - Collapse panel when no entries exist: rejected by clarification (panel must remain visible with empty state).

## Decision 3: Dynamic rendering in secondary panel content region

- Decision: Render only the active secondary entry component through `NgComponentOutlet` in `SecondaryPanelComponent`.
- Rationale: Aligns with existing shell dynamic composition approach and avoids hardcoded branching by mock type.
- Alternatives considered:
  - Template branching (`@if` by entry id): rejected due to tighter coupling and poor extensibility.
  - Route-based rendering: rejected because feature requires in-shell switching without navigation.

## Decision 4: Contract shape for secondary panel registration

- Decision: Define `ISecondaryPanelEntry` contract with a stable `id`, visible `label`, optional `icon`, and standalone `component` type.
- Rationale: Mirrors existing shell contracts and provides enough data for selection, accessibility labeling, and dynamic composition.
- Alternatives considered:
  - Reuse `IBottomPanelEntry` directly: rejected because semantics differ (secondary region behavior and default/fallback rules are specific).
  - Add domain data payload fields to contract: rejected because fake content data should remain internal to each mock component.

## Decision 5: Fake data isolation and registration bootstrap

- Decision: Keep weather/market fake datasets and components inside shell mock-ui area, registered during app bootstrap through existing mock content initialization flow.
- Rationale: Preserves testability and avoids leakage into production domain modules while staying aligned with current mock registration conventions.
- Alternatives considered:
  - Inline fake datasets in reducer/actions: rejected because state layer should remain data-agnostic regarding mock content internals.
  - Fetch fake JSON over HTTP: rejected due to unnecessary runtime dependency for a local mock validation feature.
