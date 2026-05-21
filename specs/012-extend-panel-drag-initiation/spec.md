# Feature Specification: Extend Panel Drag Initiation

**Feature Branch**: `012-extend-panel-drag-initiation`  
**Created**: 2026-05-21  
**Status**: Draft  
**Input**: User description: "Extend drag-and-drop initiation from the central region tab bar to include bottom panel and secondary panel tab bars, enabling users to drag tabs from any region to compatible drop zones with same-region reorder support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag Tab from Bottom Panel to Central Region (Priority: P1)

A user clicks and holds on a tab in the bottom panel tab bar, then drags it to the central region tab bar. If the tab's component is compatible with the central region, the tab moves from the bottom panel to the central workspace. If incompatible, the drag is rejected with visual feedback.

**Why this priority**: This is the most common cross-region move users will perform — promoting a bottom panel tool into the main workspace for focused work.

**Independent Test**: Can be fully tested by dragging a bottom panel tab to the central region tab bar and verifying the tab appears in the workspace after drop, or is rejected with visual feedback if incompatible.

**Acceptance Scenarios**:

1. **Given** a bottom panel tab whose component implements the central region interface, **When** the user drags it to the central region tab bar and releases, **Then** the tab is removed from the bottom panel and appears in the central workspace.
2. **Given** a bottom panel tab whose component does NOT implement the central region interface, **When** the user drags it to the central region tab bar and releases, **Then** the drag is rejected, the tab remains in the bottom panel, and visual feedback indicates incompatibility.
3. **Given** a bottom panel tab, **When** the user clicks without moving beyond the drag threshold, **Then** the tab is selected but no drag is initiated.

---

### User Story 2 - Drag Tab from Secondary Panel to Compatible Region (Priority: P2)

A user clicks and holds on a tab in the secondary panel tab bar, then drags it to a compatible drop zone (central region or bottom panel). If the target zone is compatible with the tab's component interfaces, the tab moves to that region.

**Why this priority**: Enables flexible workspace organization by allowing secondary panel tools to be repositioned based on user workflow needs.

**Independent Test**: Can be fully tested by dragging a secondary panel tab to a compatible drop zone and verifying the tab relocates correctly.

**Acceptance Scenarios**:

1. **Given** a secondary panel tab whose component implements the bottom panel interface, **When** the user drags it to the bottom panel and releases, **Then** the tab is removed from the secondary panel and appears in the bottom panel.
2. **Given** a secondary panel tab whose component implements the central region interface, **When** the user drags it to the central region tab bar and releases, **Then** the tab is removed from the secondary panel and appears in the central workspace.
3. **Given** a secondary panel tab, **When** the user drags it to an incompatible drop zone, **Then** the drop is rejected and the tab remains in the secondary panel.

---

### User Story 3 - Reorder Tabs Within Bottom Panel (Priority: P3)

A user clicks and holds on a tab in the bottom panel tab bar, then drags it to a different position within the same bottom panel tab bar. The tab order updates to reflect the new position.

**Why this priority**: Allows users to organize bottom panel tools by frequency of use or workflow grouping without moving them between regions.

**Independent Test**: Can be fully tested by dragging a bottom panel tab to a different position within the bottom panel and verifying the order changes.

**Acceptance Scenarios**:

1. **Given** a bottom panel with three or more tabs, **When** the user drags the tab at position 2 to position 0 and releases, **Then** the dragged tab becomes the first tab and the previous tabs shift accordingly.
2. **Given** a bottom panel with tabs, **When** the user drags a tab and releases it outside any valid reorder position, **Then** the tab returns to its original position.

---

### User Story 4 - Reorder Entries Within Secondary Panel (Priority: P3)

A user clicks and holds on an entry in the secondary panel tab bar, then drags it to a different position within the same secondary panel. The entry order updates to reflect the new position.

**Why this priority**: Consistent with bottom panel reorder, providing uniform drag behavior across all panel types.

**Independent Test**: Can be fully tested by dragging a secondary panel entry to a different position and verifying the order changes.

**Acceptance Scenarios**:

1. **Given** a secondary panel with three or more entries, **When** the user drags the entry at position 1 to position 3 and releases, **Then** the dragged entry moves to position 3 and intervening entries shift accordingly.

---

### Edge Cases

- **Drag outside any drop zone**: When a user drags a tab from any panel and releases the pointer outside all registered drop zones, the drag is cancelled and the tab remains in its original position.
- **Escape key during drag**: When a user presses the Escape key while dragging a tab from any panel, the drag is cancelled immediately and the tab returns to its original position.
- **Drag the only tab in a panel**: When a user drags the sole tab from the bottom panel to another region, the bottom panel tab bar becomes empty and the panel collapses or shows an empty state.
- **Multi-interface components**: When a component implements multiple region interfaces (e.g., both bottom panel and central region), the user can drag it to any compatible zone, and all valid drop zones show acceptance feedback.
- **Rapid successive drags**: When a user attempts to start a new drag while a previous drag is still active, the system ignores the new drag attempt until the current drag completes or is cancelled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to initiate drag operations by clicking and holding on a tab in the bottom panel tab bar.
- **FR-002**: System MUST allow users to initiate drag operations by clicking and holding on an entry in the secondary panel tab bar.
- **FR-003**: System MUST only initiate drag after the pointer moves beyond a small intentional movement threshold from the initial click position, ensuring normal clicks (select, close) do not trigger drag.
- **FR-004**: System MUST evaluate drop zone compatibility based on the component's registered interfaces when a dragged tab is released over a drop zone.
- **FR-005**: System MUST move a tab from the bottom panel to the central workspace when dropped on the central region tab bar and the component is compatible.
- **FR-006**: System MUST move a tab from the secondary panel to the central workspace or bottom panel when dropped on a compatible drop zone.
- **FR-007**: System MUST reject drops on incompatible zones and return the tab to its original position.
- **FR-008**: System MUST allow users to reorder tabs within the bottom panel tab bar via drag-and-drop.
- **FR-009**: System MUST allow users to reorder entries within the secondary panel tab bar via drag-and-drop.
- **FR-010**: System MUST provide visual feedback during drag, including a drag ghost following the pointer and drop zone highlighting for compatible zones.
- **FR-011**: System MUST cancel the drag operation when the user presses Escape or releases the pointer outside any drop zone.
- **FR-012**: System MUST preserve tab state (closable, label, icon, component reference) when moving tabs between regions.
- **FR-013**: System MUST handle components that implement multiple region interfaces by allowing drops to any compatible zone.
- **FR-014**: System MUST remove the tab from the source region when a cross-region drop succeeds.
- **FR-015**: System MUST update the tab order in the target region when a cross-region drop or same-region reorder succeeds.

### Key Entities

- **Draggable Tab**: Represents a tab that can be dragged, containing its identifier, label, icon, component type, implemented region interfaces, source zone, and metadata (closable, pinned, dirty state).
- **Drop Zone**: A region in the UI that can accept dragged tabs, identified by its zone type (central region, bottom panel, secondary panel) and compatibility rules.
- **Region Interface**: A contract that a component implements indicating which regions it can be displayed in (e.g., central region tab, bottom panel entry, secondary panel entry).
- **Cross-Region Drop Payload**: Data emitted when a tab is successfully dropped into a different region, containing the tab information, source zone, and target zone.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can drag a tab from the bottom panel to the central region and see it appear in the workspace within 100ms of releasing the pointer.
- **SC-002**: Users can drag a tab from the secondary panel to any compatible region with a 95% success rate on first attempt.
- **SC-003**: Normal click interactions (tab selection, close button) are not accidentally triggered as drag operations in 100% of cases.
- **SC-004**: Users can reorder tabs within the bottom panel and secondary panel with the new order persisting after the drag completes.
- **SC-005**: Drag cancellation (Escape key or release outside drop zone) returns the tab to its original position without any state changes in 100% of cases.
- **SC-006**: Visual feedback (drag ghost, drop zone highlighting) is displayed within 50ms of crossing the drag threshold.

## Assumptions

- The existing drag-and-drop infrastructure supports pointer events, drop zone detection, interface validation, drag ghost rendering, and cross-region drop handling.
- Drop zones for the bottom panel and secondary panel are already registered at the application shell level.
- Interface registration for bottom panel and secondary panel components is already handled when entries are added to those regions.
- The central region tab bar already supports drag initiation and same-region reorder from a previous implementation.
- Bottom panel tabs and secondary panel entries do not have pinned or dirty states (these are always false).
- Bottom panel tabs do not belong to a workspace tab group.
- The drag movement threshold is appropriate for all panel types and does not need adjustment.
- Components that implement multiple region interfaces should have all interfaces registered at the time the entry is added.
