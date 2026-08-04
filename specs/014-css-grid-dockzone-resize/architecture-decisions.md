# Architecture Decision Records: CSS Grid Dockzone Resize

## ADR-001: Use CSS Grid for Internal Zone Resizing

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: We need to implement resizing of internal dockzones within the bottom panel and primary workspaces. The existing implementation for the secondary panel and bottom panel uses CSS custom properties bound to CSS grid templates.

**Decision**: We will use CSS grid methods (`grid-template-columns`, `grid-template-rows`) for resizing internal dockzones, consistent with the existing implementation for secondary panel and bottom panel.

**Rationale**: 
- CSS grid provides better control over 2D layouts compared to flexbox
- Consistency with existing shell components (secondary panel, bottom panel)
- Better performance for layout updates via CSS custom properties
- Aligns with the project's UI framework patterns

**Alternatives considered**:
1. **Flexbox-based resizing**: Rejected because flexbox lacks 2D control for complex dockzone layouts and doesn't provide the same level of control as CSS grid.
2. **JavaScript-based dimension updates**: Rejected because CSS grid with custom properties is more performant and aligns with the established pattern.

**Consequences**:
- ✅ Consistent layout patterns across the application
- ✅ Better performance for resize operations
- ✅ Cleaner separation of concerns (CSS handles layout, JavaScript handles state)
- ⚠️ Requires understanding of CSS grid for future maintenance

---

## ADR-002: Draft State During Drag Operations

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: During drag operations, we need to show real-time visual feedback of the resize operation without committing to the NgRx store on every mouse move event.

**Decision**: We will use draft state (via BehaviorSubject) during drag operations and only commit to the NgRx store when the drag operation ends (pointer up event).

**Rationale**:
- Prevents excessive NgRx store updates during rapid drag movements
- Maintains smooth visual feedback during resize
- Aligns with existing implementation in `ShellSplitterDragService` for bottom and secondary panels
- Improves performance (>30 FPS during drag operations)

**Alternatives considered**:
1. **Commit to store on every mouse move**: Rejected because it would cause excessive store updates and potential performance issues.
2. **Use requestAnimationFrame without draft state**: Rejected because draft state provides a clear separation between draft and committed values.

**Consequences**:
- ✅ Smooth resize operations without visual stuttering
- ✅ Reduced NgRx store update frequency
- ✅ Consistent with existing splitter drag service patterns
- ⚠️ Requires careful state management for draft vs. committed values

---

## ADR-003: Minimum Size Constraints for Internal Zones

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: We need to prevent users from resizing zones below a minimum functional size.

**Decision**: We will enforce a minimum size constraint of 100px for width and height of internal zones during resize operations.

**Rationale**:
- Ensures zones remain functional and usable
- Consistent with existing minimum constraints in `layout.reducer.ts` (e.g., `BOTTOM_PANEL_HEIGHT_MIN = 100`)
- Provides a clear boundary for resize operations

**Alternatives considered**:
1. **Dynamic minimum sizes based on content**: Rejected because fixed pixel minimums are simpler to implement and consistent with existing patterns.
2. **No minimum constraints**: Rejected because it would allow users to make zones too small to be functional.

**Consequences**:
- ✅ Prevents zones from becoming too small to be functional
- ✅ Consistent with existing layout reducer constraints
- ⚠️ Users cannot create zones smaller than 100px

---

## ADR-004: Debouncing/Throttling for Rapid Drag Movements

**Date**: 2026-08-02  
**Status**: Accepted  
**Context**: Rapid drag movements can cause excessive state updates and performance issues.

**Decision**: We will use `setTimeout(0)` to coalesce rapid resize events to one dispatch per event-loop turn, similar to the existing implementation in `ShellComponent.onBottomPanelHeightChange()` and `onSecondaryPanelWidthChange()`.

**Rationale**:
- Prevents multiple store dispatches from a burst of drag events
- Allows synchronous flushing in unit tests (fakeAsync + tick(0))
- The actual frame rate is governed by CSS paint scheduling
- Aligns with existing NFR-Perf-03 requirements (>30 FPS)

**Alternatives considered**:
1. **requestAnimationFrame**: Rejected because `setTimeout(0)` allows synchronous flushing in unit tests.
2. **No debouncing/throttling**: Rejected because it would cause excessive state updates and potential performance issues.

**Consequences**:
- ✅ Smooth resize operations without visual stuttering
- ✅ Consistent with existing resize event handling
- ✅ Unit test friendly
- ⚠️ Slight delay in state updates (within acceptable bounds for UX)