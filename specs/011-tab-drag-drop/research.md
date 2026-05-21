# Research: Tab Drag-and-Drop Implementation

## Decision 1: Pointer Event Pattern for Tab Drag

**Context**: The existing `shell.component.ts` implements splitter drag using native pointer events with `setPointerCapture`, `BehaviorSubject` for draft values, and rAF throttling for smooth rendering.

**Chosen approach**: Replicate the same pointer-event pattern for tab drag:
- `pointerdown` on tab element → set `pointerId`, call `setPointerCapture(element)`, initialize drag state
- `pointermove` → update `pointerX/Y`, compute active drop zone via bounding box intersection, update drag ghost position
- `pointerup` → evaluate drop, dispatch state changes, clear drag state
- `pointercancel` → abort drag, restore original state

**Rationale**: Consistency with existing codebase patterns. HTML5 Drag and Drop API has limitations with custom ghost styling and doesn't integrate well with Angular's change detection. Pointer events provide full control over the drag lifecycle.

**Alternatives considered**:
- HTML5 Drag and Drop API — rejected due to limited ghost customization and poor Angular integration
- Third-party library (e.g., `@angular/cdk/drag-drop`) — rejected per constitution constraint against heavy UI frameworks

---

## Decision 2: Interface Detection Strategy

**Context**: When a tab is dragged, the system must know which region interfaces its component implements to validate drop targets.

**Chosen approach**: Registration metadata map maintained by `DragDropService`:
- `DragDropService` exposes `registerComponentInterface(componentType: Type<unknown>, interface: RegionInterface)`
- `ShellManager.addTab()` calls this registration method when adding a tab, passing the component type and `RegionInterface.CentralRegionTab`
- Similarly, `addBottomPanelEntry()` registers `RegionInterface.BottomPanelEntry`, etc.
- On drag start, `DragDropService` looks up the component type in the map to get the set of implemented interfaces

**Rationale**: Angular's dynamic component creation (`NgComponentOutlet`) means component instances are created at runtime, making `instanceof` checks unreliable. The registration metadata approach is deterministic, type-safe, and aligns with the existing registration pattern in `ShellManager`.

**Alternatives considered**:
- `instanceof` checks on component instances — rejected due to Angular's dynamic component creation and potential minification issues
- Reflection/metadata API — rejected as overly complex and not aligned with Angular's compilation model

---

## Decision 3: Drag Ghost Rendering

**Context**: The drag ghost is a visual representation of the dragged tab that follows the cursor during drag operations.

**Chosen approach**: `DragGhostComponent` — a dedicated Angular component rendered at the shell root level:
- Positioned with `position: fixed` and `pointer-events: none`
- Bound to `DragDropService` state via NgRx selector or direct service subscription
- Displays tab label, icon (if available), and a visual indicator of drop compatibility
- Created/destroyed via `*ngIf` based on `DragDropService.activeDragState$`

**Rationale**: Keeps the ghost within Angular's change detection tree, enabling reactive updates (e.g., changing ghost appearance based on drop zone compatibility). CSS styling is consistent with the rest of the shell. No manual DOM manipulation required.

**Alternatives considered**:
- Dynamically created DOM element (`document.createElement`) — rejected as it bypasses Angular's rendering pipeline
- Clone of the original tab element — rejected as it would require complex DOM manipulation and styling synchronization

---

## Decision 4: Drop Zone Detection

**Context**: The system must determine which drop zone (if any) the dragged tab is currently over.

**Chosen approach**: Bounding box intersection via `getBoundingClientRect()`:
- Each drop zone registers its element reference with `DragDropService` on component init
- On each `pointermove` during drag, `DragDropService` iterates registered zones and checks if `(pointerX, pointerY)` falls within the zone's bounding rect
- The first matching zone becomes the `activeDropZone`; if none match, `activeDropZone` is null
- Drop zones are checked in priority order: same-region reorder → cross-region drop

**Rationale**: Simple, deterministic, and consistent with the existing splitter drag boundary detection. No additional event listeners or DOM mutations required. Works reliably across all pointer device types.

**Alternatives considered**:
- CSS `:hover` pseudo-class detection — rejected as it requires CSS class manipulation and doesn't provide programmatic access
- `Document.elementFromPoint()` — rejected as it returns the topmost element, which would be the drag ghost (blocked by `pointer-events: none` but still fragile)
- IntersectionObserver API — rejected as it's designed for scroll-based visibility, not pointer position tracking
