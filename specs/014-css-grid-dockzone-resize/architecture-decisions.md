# Architecture Decision Records: Internal Zone Resize via Flex Layout

## ADR-001: Use Flexbox-based Resizing for Internal Zones

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: We need to implement resizing of internal dockzones within the bottom panel and primary workspaces. The existing implementation for the secondary panel and bottom panel uses CSS custom properties bound to CSS grid templates, but the internal zones use a flexbox-based layout structure (`layout-splittable-row-wrapper`, `layout-splittable-row`, `splittable-panel-region`).

**Decision**: We will use flexbox-based inline style bindings for resizing internal dockzones, applying draft dimensions to the `style.width` and `style.flex` properties of the `splittable-panel-region` elements.

**Rationale**: 
- The existing layout structure for internal zones uses flexbox (`display: inline-flex` with `flex: 1`), not CSS grid
- Flexbox provides adequate 1D control for row/column resizing within the existing layout structure
- Consistency with the existing flex-based layout pattern for internal dockzones
- Avoids introducing CSS grid variables and templates that don't match the dynamic number of zones

**Alternatives considered**:
1. **CSS grid-based resizing**: Rejected because the existing layout structure uses flexbox, not CSS grid, and CSS grid with fixed variables would only work for 2 zones.
2. **JavaScript-based dimension updates via NgRx store on every move**: Rejected because inline style bindings via `DragOperation` are more performant and align with the established pattern.

**Consequences**:
- ✅ Consistent with the existing flex-based layout structure for internal zones
- ✅ Supports dynamic number of zones (rows/columns) via flexbox
- ✅ Cleaner separation of concerns (CSS handles flex layout, JavaScript handles state via DragOperation)
- ⚠️ Requires careful state management for draft vs. committed values via `InternalZoneDragDraft` and `InternalZoneDragEnd`

---

## ADR-002: Unified DragOperation Class for All Drag Types

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: We have different drag operations for bottom panel (vertical), secondary panel (horizontal), and internal zones (dynamic direction). We need a unified approach to handle all drag operations.

**Decision**: We will use a unified `DragOperation<TDraft, TEnd>` class that handles both simple drag (bottom/secondary panels) and internal zone drag with dynamic directions, using generics to type-safe handle the different draft and end types.

**Rationale**:
- Provides a single, consistent implementation for all drag operations
- Type-safe handling of different draft and end types via generics
- Simplifies the `ShellSplitterDragService` by delegating to `DragOperation` instances
- Aligns with existing patterns for bottom and secondary panel drag operations

**Alternatives considered**:
1. **Separate drag service classes for each drag type**: Rejected because it would lead to code duplication and inconsistent drag behavior.
2. **Inline drag state management in ShellSplitterDragService**: Rejected because the `DragOperation` class provides a cleaner, more testable abstraction.

**Consequences**:
- ✅ Consistent drag behavior across all panel types
- ✅ Type-safe drag state management via generics
- ✅ Simplified `ShellSplitterDragService` implementation
- ⚠️ Requires understanding of TypeScript generics for future maintenance

---

## ADR-003: Draft State During Drag Operations

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: During drag operations, we need to show real-time visual feedback of the resize operation without committing to the NgRx store on every mouse move event.

**Decision**: We will use draft state (via `BehaviorSubject`) during drag operations and only commit to the NgRx store when the drag operation ends (pointer up event), using the `DragOperation` class to manage the draft and end states.

**Rationale**:
- Prevents excessive NgRx store updates during rapid drag movements
- Maintains smooth visual feedback during resize via inline style bindings
- Aligns with existing implementation in `DragOperation` for bottom and secondary panels
- Improves performance (>30 FPS during drag operations)

**Alternatives considered**:
1. **Commit to store on every mouse move**: Rejected because it would cause excessive store updates and potential performance issues.
2. **Use requestAnimationFrame without draft state**: Rejected because draft state via `BehaviorSubject` provides a clear separation between draft and committed values.

**Consequences**:
- ✅ Smooth resize operations without visual stuttering
- ✅ Reduced NgRx store update frequency
- ✅ Consistent with `DragOperation` patterns
- ⚠️ Requires careful state management for draft vs. committed values

---

## ADR-004: Minimum Size Constraints for Internal Zones

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: We need to prevent users from resizing zones below a minimum functional size or above a maximum functional size.

**Decision**: We will enforce a minimum size constraint of 100px and a maximum size constraint of 1000px for internal zones during resize operations, handled by the `DragOperation` class.

**Rationale**:
- Ensures zones remain functional and usable
- Consistent with existing minimum constraints in `layout.reducer.ts` (e.g., `BOTTOM_PANEL_HEIGHT_MIN = 100`)
- Provides a clear boundary for resize operations
- Handled automatically by `DragOperation` via `Math.min(this.maxDimension, Math.max(this.minDimension, Math.round(...)))`

**Alternatives considered**:
1. **Dynamic minimum sizes based on content**: Rejected because fixed pixel minimums are simpler to implement and consistent with existing patterns.
2. **No maximum constraints**: Rejected because it would allow users to make zones too large and disrupt the layout.

**Consequences**:
- ✅ Prevents zones from becoming too small or too large to be functional
- ✅ Consistent with existing layout reducer constraints
- ✅ Handled automatically by `DragOperation` class