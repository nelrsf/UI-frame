# Research: Dock Region Resize

**Feature**: 004-dock-region-resize  
**Phase**: 0 - Research  
**Date**: 2026-05-07

## Decision 1: Commit-only state updates for resize

**Decision**: Keep pointer-move state local to the shell interaction layer and dispatch NgRx layout updates only when drag ends (commit).

**Rationale**:
- Matches clarified requirement (NgRx update on commit only).
- Avoids high-frequency store churn and unnecessary global selector fan-out during drag.
- Keeps persistence-ready source of truth as committed values.

**Alternatives considered**:
- Dispatch on every pointer move: rejected due to noise/perf overhead and lower signal quality for persistence.
- Dispatch on throttled interval: rejected because it still introduces non-essential intermediate global states.

## Decision 2: Normalize resize event contract to region-based event

**Decision**: Add one typed EventBus event for committed dock resize, `shell.region.resized.v1`, carrying region and dimensions in integer pixels.

**Rationale**:
- Unified event naming and payload shape simplifies future listeners and analytics.
- Preserves existing event-version convention (`*.v1`).
- Explicit region field supports Bottom, Secondary, and Workspace derivation semantics.

**Alternatives considered**:
- Keep only panel-specific events (`bottomPanel.resized.v1`): rejected because it does not scale cleanly to all required regions.
- Emit multiple events per interaction phase: rejected because current scope requires commit-only publication.

## Decision 3: Enforce per-region min/max clamping in reducer

**Decision**: Keep min/max constraints for each resizable region in the layout reducer boundary and clamp all committed values there.

**Rationale**:
- Centralized invariant enforcement regardless of event source.
- Compatible with restore flows already clamped in reducer.
- Aligns with clarified per-region limits and integer-pixel storage.

**Alternatives considered**:
- Clamp only in component/drag handler: rejected because bypass paths could still inject invalid values.
- Use one global limit for all regions: rejected by clarification (limits are per region).

## Decision 4: Internal splitters only, no forbidden-region resize affordance

**Decision**: Render and wire resize handles only at Bottom-Workspace and Secondary-Workspace internal boundaries; do not attach resize affordances to Sidebar, Activity Bar, Toolbar, Status Bar, or window frame edges.

**Rationale**:
- Directly enforces feature scope boundaries.
- Prevents accidental UX regressions in non-resizable shell regions.
- Maintains native Electron window-edge behavior untouched.

**Alternatives considered**:
- Reuse sidebar resize path: rejected because sidebar is explicitly out of scope for this feature.
- Global drag overlay over shell edges: rejected due to ambiguity and risk of conflicting with native window operations.

## Decision 5: Native cursor feedback from handle hit zones

**Decision**: Apply cursor states from explicit handle hit zones (`ns-resize` for horizontal splitter, `ew-resize` for vertical splitter) and reset outside those zones.

**Rationale**:
- Deterministic and testable cursor behavior.
- Matches user expectation for native desktop resize affordance.
- Avoids false positives in non-resizable regions.

**Alternatives considered**:
- Cursor driven by broad container hover: rejected due to accidental resize affordances.
- Custom cursor assets: rejected in favor of native cursor semantics.
