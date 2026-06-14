# Feature Specification: Extend Panel Drag Initiation

**Feature Branch**: `012-extend-panel-drag-initiation`  
**Created**: 2026-05-21  
**Updated**: 2026-06-14
**Status**: Draft - aligned to current implementation
**Input**: User description: "Extend drag-and-drop initiation from the central region tab bar to include bottom panel and secondary panel tab bars, enabling users to drag tabs from any region to compatible drop zones with same-region reorder support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Drag Tab from Bottom Panel to Central Workspace (Priority: P1)

A user clicks and holds on a tab in any bottom dock zone tab bar, then drags it to a compatible primary workspace dock zone. If the tab allows that target zone, the tab moves from the bottom panel to the selected workspace zone. If incompatible, the drop is rejected with visual feedback.

**Why this priority**: This is the most common cross-region move users will perform - promoting a bottom panel tool into the main workspace for focused work.

**Independent Test**: Can be fully tested by dragging a bottom panel tab to a compatible primary workspace dock zone and verifying the tab appears there after drop, or is rejected with visual feedback if incompatible.

**Acceptance Scenarios**:

1. **Given** a bottom panel tab whose draggable metadata allows a primary workspace target, **When** the user drags it to that workspace tab bar and releases, **Then** the tab is removed from the bottom panel and appears in the target workspace zone.
2. **Given** a bottom panel tab whose draggable metadata does not allow the hovered workspace target, **When** the user releases it over that target, **Then** the drag is rejected, the tab remains in the bottom panel, and visual feedback indicates incompatibility.
3. **Given** a bottom panel tab, **When** the user clicks without moving beyond the drag threshold, **Then** the tab is selected but no drag is initiated.

---

### User Story 2 - Drag Tab from Secondary Panel to Compatible Region (Priority: P2)

A user clicks and holds on a tab in the secondary panel tab bar, then drags it to any compatible dock zone. If the target zone is allowed by the tab's draggable metadata, the tab moves to that region.

**Why this priority**: Enables flexible workspace organization by allowing secondary panel tools to be repositioned based on user workflow needs.

**Independent Test**: Can be fully tested by dragging a secondary panel tab to a compatible drop zone and verifying the tab relocates correctly.

**Acceptance Scenarios**:

1. **Given** a secondary panel tab whose draggable metadata allows a bottom dock zone, **When** the user drags it to that bottom dock zone and releases, **Then** the tab is removed from the secondary panel and appears in the bottom dock zone.
2. **Given** a secondary panel tab whose draggable metadata allows a primary workspace zone, **When** the user drags it to that workspace tab bar and releases, **Then** the tab is removed from the secondary panel and appears in the workspace zone.
3. **Given** a secondary panel tab, **When** the user drags it to an incompatible drop zone, **Then** the drop is rejected and the tab remains in the secondary panel.

---

### User Story 3 - Reorder Tabs Within Any Dock Zone (Priority: P3)

A user clicks and holds on a tab in a dock zone tab bar, then drags it to a different position within the same tab bar. The tab order updates to reflect the new position.

**Why this priority**: Allows users to organize panel and workspace tabs by frequency of use or workflow grouping without moving them between regions.

**Independent Test**: Can be fully tested by dragging a tab to a different position within the same dock zone and verifying the order changes.

**Acceptance Scenarios**:

1. **Given** a dock zone with three or more tabs, **When** the user drags the tab at position 2 to position 0 and releases, **Then** the dragged tab becomes the first tab and the previous tabs shift accordingly.
2. **Given** a dock zone with tabs, **When** the user drags a tab and releases it outside any valid drop or reorder position, **Then** the tab returns to its original position.

---

### User Story 4 - Restore Dragged and Reordered Tabs After Workspace Reload (Priority: P1)

A user moves or reorders tabs across dock zones, closes or reloads the application, and returns to the same workspace. The shell restores the same tab membership, tab order, and active tab for each restorable dock zone.

**Why this priority**: Drag and reorder changes are workspace organization work. Losing them after reload makes the feature feel temporary and undermines the shell's persistence contract.

**Independent Test**: Can be fully tested by performing a cross-zone move and same-zone reorder, saving/restoring the workspace session, and verifying the restored shell matches the final layout.

**Acceptance Scenarios**:

1. **Given** a user moves a restorable tab from a bottom dock zone to a primary workspace zone, **When** the workspace session is saved and restored, **Then** the tab is restored in the primary workspace zone and not duplicated in the source zone.
2. **Given** a user reorders restorable tabs in a dock zone, **When** the workspace session is saved and restored, **Then** the restored tab order matches the order after the drag completed.
3. **Given** a dock zone has an active tab after a drag or reorder, **When** the workspace session is saved and restored, **Then** that dock zone restores the same active tab when the tab is restorable.
4. **Given** a moved tab is not restorable by session metadata, **When** the workspace session is saved, **Then** the persisted session excludes that tab and restores the remaining restorable tabs without corrupting zone order.

---

### Edge Cases

- **Drag outside any drop zone**: When a user drags a tab from any dock zone and releases the pointer outside all registered drop zones, the drag is cancelled and the tab remains in its original position.
- **Escape key during drag**: When a user presses Escape while dragging a tab from any dock zone, the drag is cancelled immediately and the tab returns to its original position.
- **Drag the only tab in a zone**: When a user drags the sole tab from a source zone to another compatible zone, the source zone becomes empty and remains in a valid empty state.
- **Multi-target tabs**: When a tab allows multiple dock zones, the user can drag it to any allowed zone, and all valid hovered drop zones show acceptance feedback.
- **Rapid successive drags**: When a user attempts to start a new drag while a previous drag is still active, the system ignores the new drag attempt until the current drag completes or is cancelled.
- **Persistence fallback**: When restored session data is corrupt, schema-incompatible, or references unavailable tab descriptors, the shell falls back to safe defaults and does not duplicate or lose valid restorable tabs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to initiate drag operations by clicking and holding on a tab rendered in a bottom dock zone tab bar.
- **FR-002**: System MUST allow users to initiate drag operations by clicking and holding on a tab rendered in the secondary panel tab bar.
- **FR-003**: System MUST only initiate an active drag after the pointer moves beyond a small intentional movement threshold from the initial click position, ensuring normal clicks and close interactions do not trigger drag.
- **FR-004**: System MUST evaluate drop compatibility using each tab's draggable metadata and allowed dock-zone targets.
- **FR-005**: System MUST move a tab from a bottom dock zone to a compatible primary workspace dock zone when the user drops it on that workspace tab bar.
- **FR-006**: System MUST move a tab from the secondary panel to any compatible primary workspace or bottom dock zone when the user drops it on that zone.
- **FR-007**: System MUST reject drops on incompatible zones and keep the tab in its original zone and order.
- **FR-008**: System MUST allow users to reorder tabs within any dock zone that renders a tab bar.
- **FR-009**: System MUST provide visual feedback during drag, including a drag ghost following the pointer and drop-zone highlighting for compatible and incompatible hovered zones.
- **FR-010**: System MUST cancel the drag operation when the user presses Escape or releases the pointer outside any drop zone or valid reorder position.
- **FR-011**: System MUST preserve tab display and behavioral state that is represented by the tab model, including identifier, label, icon, component reference, closeability, pin state, and draggable metadata.
- **FR-012**: System MUST support tabs that allow multiple target zones by accepting drops into any allowed zone.
- **FR-013**: System MUST remove the tab from the source zone when a cross-zone drop succeeds.
- **FR-014**: System MUST update tab order in the target zone when a cross-zone drop includes an insertion position or when a same-zone reorder succeeds.
- **FR-015**: System MUST keep dock-zone tab membership, tab order, and active tab selection in NgRx workspace state after each successful move or reorder.
- **FR-016**: System MUST persist restorable tab descriptors, their dock-zone membership, their order within each zone, and the active tab per zone into the workspace session snapshot.
- **FR-017**: System MUST restore persisted tab membership, order, and active tab per zone from a valid workspace session during shell initialization.
- **FR-018**: System MUST ignore corrupt, schema-incompatible, or non-restorable persisted tab entries without preventing valid workspace layout restoration.

### Key Entities

- **Shell Tab**: A rendered shell tab with stable identifier, label, optional icon, component reference, closeability, pin state, and optional draggable metadata.
- **Draggable Metadata**: The tab metadata that identifies the source dock zone, current target zone, allowed drop targets, and optional reorder insertion index.
- **Dock Zone**: A fixed shell region that can render a tab bar and accept dragged tabs, including primary workspace zones, bottom panel zones, and the secondary panel.
- **Workspace State**: The NgRx state that tracks tab arrays by dock zone and active tab identifiers by dock zone.
- **Workspace Session Snapshot**: The persisted workspace representation used to restore restorable tabs, dock-zone assignments, active tab per zone, and layout dimensions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can drag a tab from a bottom dock zone to a compatible primary workspace zone and see it appear there within 100ms of releasing the pointer.
- **SC-002**: Users can drag a tab from the secondary panel to any compatible region with a 95% success rate on first attempt during manual validation.
- **SC-003**: Normal click interactions (tab selection, close button) are not accidentally triggered as drag operations in 100% of automated pointer-threshold test cases.
- **SC-004**: Users can reorder tabs within bottom, secondary, and primary workspace dock zones, and the new order is reflected immediately after the drag completes.
- **SC-005**: Drag cancellation (Escape key or release outside a valid drop/reorder target) returns the tab to its original position without state changes in 100% of automated cancellation test cases.
- **SC-006**: Visual feedback (drag ghost, compatible/incompatible drop-zone highlighting) is displayed within 50ms of crossing the drag threshold.
- **SC-007**: After saving and restoring a workspace session, 100% of restorable tabs retain their persisted dock zone, order, and active-tab selection.
- **SC-008**: Corrupt or incompatible persisted session data never prevents the shell from loading with safe defaults.

## Assumptions

- The current shell renders dock-zone tab bars through `DockZonePanelComponent` rather than separate bottom-panel and secondary-panel tab components.
- The current dock-zone model includes multiple primary workspace zones and multiple bottom panel zones; the feature applies to all dock zones that render a tab bar and are registered as drop zones.
- Compatibility is represented by tab draggable metadata (`allowableDropTargets`) rather than a separate `RegionInterface` registry.
- NgRx workspace state (`tabsByZone` and `activeTabIdsByZone`) is the source of truth for tab membership, ordering, and active selection during runtime.
- Workspace session persistence already provides a versioned, workspace-scoped snapshot mechanism; this feature extends its usage for moved and reordered restorable tabs.
- Only restorable tabs with serializable descriptors are persisted across sessions; non-restorable runtime-only tabs may be omitted on restore.
- The drag movement threshold is appropriate for all dock-zone tab bars and does not need adjustment.
