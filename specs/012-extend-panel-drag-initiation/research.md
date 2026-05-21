# Research: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Feature**: 012-extend-panel-drag-initiation

## Technical Context Resolution

All technical context items were resolved from the existing codebase and spec 011-tab-drag-drop implementation. No NEEDS CLARIFICATION items remain.

### DragDropService Architecture

- **Decision**: Reuse existing `DragDropService` without modifications
- **Rationale**: The service already implements pointer event-based drag with 4px threshold, drop zone detection, interface validation, drag ghost rendering, and cross-region drop emission. Adding drag initiation to bottom/secondary panels only requires constructing `DraggableTab` objects with correct `sourceZone` values.
- **Alternatives considered**: 
  - Create separate service for panel drag — rejected due to code duplication and inconsistent behavior
  - Modify existing service to accept panel types directly — rejected as it would complicate the service API unnecessarily

### Same-Region Reorder Implementation

- **Decision**: Create new NgRx actions for bottom panel and secondary panel reorder (Option A from spec)
- **Rationale**: Cleaner separation of concerns. Each panel type has its own data model (`PanelTab` vs `SecondaryPanelEntry`), so mapping to the central region's `TabItem` model would add complexity. Zone-specific actions keep the reducer logic simple and type-safe.
- **Alternatives considered**:
  - Reuse existing `reorderTab` action with virtual tab group mapping — rejected due to type conversion complexity and potential for state corruption
  - Use component-local state for reorder — rejected as it would violate Principle III (Single Reactive Paradigm) by bypassing NgRx

### Interface Registration for Multi-Interface Components

- **Decision**: Verify existing `ShellManager` behavior; no new registration mechanism needed for this feature
- **Rationale**: The spec notes that `ShellManager` already registers interfaces when entries are added. If a component implements multiple interfaces, the registration should happen at entry creation time. This is outside the scope of drag initiation but should be verified during implementation.
- **Alternatives considered**: N/A — existing mechanism is sufficient

### Circular Dependency Prevention

- **Decision**: Continue using `Injector.get(DragDropService)` pattern in `ShellManager`
- **Rationale**: Direct constructor injection causes NG0200 circular dependency error. Lazy resolution via `Injector` is the established pattern and works correctly.
- **Alternatives considered**: N/A — this is a constraint, not a choice

## Performance Considerations

- Pointer event handlers are lightweight and only activate on `pointerdown` with left button check
- `DragDropService.isDragging()` uses a simple boolean flag, suitable for template binding with `OnPush` change detection
- Drag ghost rendering is already optimized with `AsyncPipe` and `ChangeDetectionStrategy.OnPush`

## Testing Strategy

- Unit tests for new component handlers (`onTabPointerDown`, `onEntryPointerDown`)
- Component tests for pointer event binding in templates
- Integration tests for cross-region drag from bottom/secondary panels
- Edge case tests for escape cancellation, outside-drop-zone release, and single-tab drag
