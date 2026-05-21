# Feature Specification: Tab Drag-and-Drop Across Regions

**Feature Branch**: `011-description-tab-dragr`  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: User description: "Vamos a crear la funcionalidad de drag en la aplicacion. Debes considerar un servicio que maneje el drag and drop en el shell. Cuando se arrastra una tab de una region a otra la tab se traslada pero con la condicion de cumplir la interfaz, por ejemplo: Si se suelta una tab desde el central region tab hacia el bottom panel, entonces la tab tambien debe implementar IBottomPanelEntry. Es decir para que el elemento tab pase a otra region debe implementar la respectiva interfaz."

## Clarifications

### Session 2026-05-20

- Q: When a tab moves between regions, does it keep its original registration or get re-registered? → A: Unregister from source region, re-register in target region (clean separation)
- Q: Should drag initiation be enabled on all region tab bars at once or phased? → A: Start with central region tab bar only; leave implementation guide for bottom/secondary panels in next spec

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag Tab Between Compatible Regions (Priority: P1)

A user clicks and holds a tab in one region (e.g., central workspace tab bar), drags it over another region's drop zone (e.g., bottom panel), and releases it. If the tab's underlying component implements the target region's required interface (e.g., `IBottomPanelEntry` for the bottom panel), the tab is moved to that region. If it does not implement the required interface, the drop is rejected and the tab remains in its original position.

**Why this priority**: This is the core value proposition — users need to reorganize their workspace by moving tabs between regions, with type safety enforced by interface contracts.

**Independent Test**: Can be fully tested by dragging a tab that implements both `ICentralRegionTab` and `IBottomPanelEntry` from the central region to the bottom panel drop zone, releasing it, and verifying the tab appears in the bottom panel and disappears from the central region.

**Acceptance Scenarios**:

1. **Given** a tab is open in the central region and its component implements `IBottomPanelEntry`, **When** the user drags the tab to the bottom panel drop zone and releases, **Then** the tab is removed from the central region and appears as a new entry in the bottom panel.
2. **Given** a tab is open in the central region and its component does NOT implement `IBottomPanelEntry`, **When** the user drags the tab to the bottom panel drop zone and releases, **Then** the drop is rejected, the tab remains in the central region, and visual feedback indicates the drop was not allowed.
3. **Given** a tab is open in the bottom panel and its component implements `ICentralRegionTab`, **When** the user drags the tab to the central region tab bar and releases, **Then** the tab is removed from the bottom panel and appears in the central region tab bar.

---

### User Story 2 - Visual Drag Feedback (Priority: P2)

While dragging a tab, the user sees a visual representation of the dragged tab (drag ghost), and potential drop zones highlight when the dragged tab is hovered over them. Drop zones that are incompatible with the dragged tab show a "not allowed" indicator.

**Why this priority**: Without clear visual feedback, users cannot understand which regions accept the dragged tab or where they can drop it.

**Independent Test**: Can be fully tested by starting a drag operation on any tab and observing that a drag ghost follows the cursor, compatible drop zones highlight visually, and incompatible drop zones show a rejection indicator.

**Acceptance Scenarios**:

1. **Given** a user starts dragging a tab, **When** the pointer moves, **Then** a drag ghost showing the tab label follows the cursor.
2. **Given** a user is dragging a tab over a compatible drop zone, **When** the pointer enters the drop zone, **Then** the drop zone highlights with an "accept" visual indicator (e.g., green border or background).
3. **Given** a user is dragging a tab over an incompatible drop zone, **When** the pointer enters the drop zone, **Then** the drop zone shows a "not allowed" visual indicator (e.g., red border or crossed-out icon).

---

### User Story 3 - Drag Tab to Reorder Within Same Region (Priority: P3)

A user drags a tab and drops it at a different position within the same tab bar, reordering the tabs.

**Why this priority**: Reordering within the same region is a natural extension of drag behavior and improves workspace organization, though it is secondary to cross-region movement.

**Independent Test**: Can be fully tested by dragging a tab from position 2 to position 0 within the same tab bar and verifying the tab order changes accordingly.

**Acceptance Scenarios**:

1. **Given** a tab bar has multiple tabs, **When** the user drags a tab to a different position within the same tab bar and releases, **Then** the tab moves to the new position and the other tabs shift accordingly.

---

### Edge Cases

- What happens when a user drops a tab outside of any valid drop zone? The drag operation is cancelled and the tab remains in its original position.
- How does the system handle a tab that implements multiple region interfaces (e.g., both `IBottomPanelEntry` and `ISecondaryPanelEntry`)? The tab can be dropped in any region whose interface it implements; the target region is determined by where the user drops it.
- What happens if the dragged tab is the only tab in its source region and it is moved away? The source region's tab bar becomes empty and may hide itself or show a placeholder.
- How does the system handle a drag operation that starts but the user presses Escape? The drag operation is cancelled and the tab remains in its original position.
- What happens when a pinned tab is dragged to another region? The tab retains its pinned status in the new region.
- Can users drag tabs from the bottom panel or secondary panel tab bars? No — drag initiation is limited to the central region tab bar in this iteration. Bottom/secondary panel drag initiation is deferred to a follow-up spec.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a drag-and-drop service at the shell level that coordinates drag operations across all regions.
- **FR-002**: System MUST allow users to initiate a drag operation by clicking and holding on any tab in the central region tab bar. Drag initiation on bottom panel and secondary panel tab bars is out of scope for this iteration.
- **FR-003**: System MUST validate that a tab's underlying component implements the target region's required interface before allowing a drop (e.g., `IBottomPanelEntry` for bottom panel, `ICentralRegionTab` for central region, `ISecondaryPanelEntry` for secondary panel).
- **FR-004**: System MUST reject drops on regions where the tab's component does not implement the required interface, leaving the tab in its original position.
- **FR-005**: System MUST provide visual feedback during drag operations, including a drag ghost, drop zone highlighting for compatible regions, and rejection indicators for incompatible regions.
- **FR-006**: System MUST allow users to reorder tabs within the same region's tab bar by dragging and dropping to a different position.
- **FR-007**: System MUST cancel the drag operation and restore the tab to its original position if the user releases outside any valid drop zone or presses Escape.
- **FR-008**: System MUST unregister the tab from the source region and re-register it in the target region after a successful cross-region drop, using the target region's native registration mechanism.
- **FR-009**: System MUST preserve the tab's metadata (id, label, icon, pinned status, dirty flag) when moving between regions.
- **FR-010**: System MUST support tabs that implement multiple region interfaces, allowing them to be dropped in any compatible region.

### Key Entities

- **DraggableTab**: Represents a tab that can be dragged. Contains the tab's metadata (id, label, icon, component type) and a list of region interfaces the component implements. On cross-region move, the DraggableTab is unregistered from the source region and a new registration is created in the target region.
- **DropZone**: Represents a region area that can accept dropped tabs. Associated with a specific `DockZone` and the interface type required for acceptance.
- **DragState**: Tracks the current drag operation state, including the source tab, source region, current pointer position, and active drop zone.
- **DragDropService**: Central service that manages the lifecycle of drag operations, validates drop targets, and coordinates state updates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can move a tab between compatible regions in a single drag-and-drop operation completed in under 2 seconds.
- **SC-002**: 100% of drop attempts onto incompatible regions are correctly rejected with clear visual feedback.
- **SC-003**: 95% of users can successfully move a tab between regions on their first attempt without instructions.
- **SC-004**: Drag operations respond to pointer movement with no perceptible lag (under 16ms frame delay).

## Assumptions

- The existing `DockZone` enum (`PrimaryWorkspace`, `BottomPanel`, `SecondaryPanel`) defines all target regions for drag-and-drop.
- The existing `reorderTab` action in the workspace state will be reused for same-region reordering.
- Cross-region tab movement uses the target region's native registration method (e.g., `addBottomPanelEntry`, `addTab`) rather than a zone assignment overlay.
- Each region provides or will provide an unregister/remove method for its entries (e.g., `removeTab`, `removeBottomPanelEntry`) to support the unregister-before-reregister lifecycle.
- The shell already has splitter drag functionality for resizing panels; this feature builds on similar pointer-event patterns but targets tab movement.
- Pinned tabs can be moved between regions and retain their pinned status.
- The drag-and-drop implementation uses native pointer events (not HTML5 Drag and Drop API) for consistency with existing splitter drag behavior.
- Mobile/touch support is out of scope for the initial implementation; this feature targets desktop pointer (mouse) interactions.
- Drag initiation is scoped to the central region tab bar only for this iteration. Bottom panel and secondary panel drag initiation will be implemented in a follow-up spec.
