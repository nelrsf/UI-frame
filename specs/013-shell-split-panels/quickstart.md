# Quickstart: Shell Split Panels

**Date**: 2026-06-15  
**Feature**: 013-shell-split-panels

## Goal

Add split behavior for the primary workspace and bottom panel using a `layout-splittable-panel` wrapper that manages a grid of `app-dock-zone-panel` instances via a 2D visibility matrix.

## Implementation Architecture

The feature uses a **static grid approach** rather than dynamic element creation:
- **Grid Matrix**: The component accepts a 2D array of `DockZone` (`zones: Array<DockZone[]>`).
- **State Management**: A local `panelStates: PanelState[][]` matrix tracks the `visible` property for each cell in the grid.
- **Splitting**: Toggling "split" simply marks the next available row or column in the matrix as `visible`.
- **Tab Migration**: When a pane is closed, its tabs are automatically migrated to the first active panel to prevent data loss.

## Integration Steps

1. **Component Setup**: Use `LayoutSplittablePanelComponent` with the following configuration in `shell.component.html`:
   - **Primary Workspace**: `direction="vertical"`, 2x2 grid of `Primary...Workspace` zones.
   - **Bottom Panel**: `direction="horizontal"`, 1x3 grid of `Bottom...Panel` zones.
2. **Boundary Handling**: Resizing is handled by `app-shell-splitter-handle` components, which are conditionally rendered between visible panels.
3. **State Flow**:
   - **Input**: Tab and active ID data flow into the component via NgRx selectors (`selectShellTabs`, `selectActiveIds`).
   - **Output**: Tab movements within the split grid are dispatched back to the store via `moveTabToZone` and `selectTab` actions.
4. **Closing Panels**: Use the `closePanel` output to notify the shell of visibility changes.

## Acceptance Criteria

- **Grid-based Splitting**: Clicking the split button enables the next hidden panel in the predefined grid.
- **Responsive Resizing**: `app-shell-splitter-handle` allows users to resize visible panes.
- **Tab Continuity**: Closing a panel moves all its tabs to another visible panel.
- **Capacity Limits**: Split buttons automatically hide when all panels in the grid matrix are already visible.
- **Store Integration**: Tab selections and movements within the grid are reactively synced with the NgRx workspace state.

## Testing Guidance

- **Grid Verification**: Verify that splitting a 2x2 workspace correctly enables panels in the intended sequence.
- **Tab Migration**: Close a pane containing multiple tabs and verify they all move to the first remaining active panel.
- **Boundary Logic**: Ensure splitter handles only appear between two *visible* adjacent panels.
- **UI/UX**: Confirm the split button hides exactly when `areAllPanelsVisible()` or `areAllRowsVisible()` returns true.
