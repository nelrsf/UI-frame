# Quickstart: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Updated**: 2026-06-14
**Feature**: 012-extend-panel-drag-initiation

## Prerequisites

- Node.js and npm installed
- Existing UI Frame project with the generic dock-zone shell implementation
- Current working branch contains `DockZonePanelComponent`, `DragDropService`, and NgRx workspace state

## Verify Current Runtime Drag Behavior

1. **Build the app**:
   ```bash
   npm.cmd run build
   ```

2. **Start the app for manual validation**:
   ```bash
   npm.cmd start
   ```

3. **Manual drag checks**:
   - Drag a tab in a bottom dock zone to a compatible primary workspace zone.
   - Drag a tab in the secondary panel to a compatible bottom or primary zone.
   - Drag a tab within the same dock zone to reorder it.
   - Drag to an incompatible zone and verify rejection feedback.
   - Press Escape during an active drag and verify cancellation.

## Implementation Focus Still Pending

1. **Align legacy tests**:
   - Replace obsolete `DockZone.PrimaryWorkspace` and `DockZone.BottomPanel` test references with current split dock-zone values.
   - Update workspace reducer tests from legacy `tabs` / `bottomPanelTabs` shape to `tabsByZone`.
   - Remove expectations for removed `addBottomPanelEntry`, `addSecondaryPanelEntry`, and `registerReorderSource` contracts.

2. **Connect successful drag outcomes to persistence**:
   - Convert `WorkspaceState.tabsByZone` and `activeTabIdsByZone` into serializable session data.
   - Persist only restorable tabs through `WorkspaceSessionService`.
   - Save after successful `moveTabToZone` and `reorderTab` outcomes, not during pointer movement.

3. **Restore persisted tab organization**:
   - Add/update NgRx workspace restore action(s).
   - Rehydrate `tabsByZone` and `activeTabIdsByZone` from a valid `WorkspaceSession`.
   - Ignore corrupt or non-restorable entries without blocking shell startup.

## Testing

1. **Application build**:
   ```bash
   npm.cmd run build
   ```

2. **Full automated suite**:
   ```bash
   npm.cmd run test:coverage:ci
   ```

3. **Persistence validation scenario**:
   - Open or register restorable tabs in at least two dock zones.
   - Move one restorable tab to another compatible zone.
   - Reorder tabs inside one zone.
   - Save the workspace session.
   - Restore the workspace session.
   - Verify tab membership, order, and active tab per zone match the pre-save state.

## Verification

- No circular DI errors in console.
- Drag threshold works correctly for all dock-zone tab bars.
- Visual feedback appears during drag.
- Cross-zone drops update NgRx workspace state.
- Same-zone reorders update NgRx workspace state.
- Successful move/reorder outcomes persist and restore through the workspace session.
- Cancelled and incompatible drags do not alter runtime or persisted tab order.
