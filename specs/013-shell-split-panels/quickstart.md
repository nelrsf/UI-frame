# Quickstart: Shell Split Panels

**Date**: 2026-05-30  
**Feature**: 013-shell-split-panels

## Goal

Add split behavior for the primary workspace and bottom panel using a new `layout-splittable-panel` wrapper around existing `app-dock-zone-panel` instances.

## Implementation Steps

1. Create `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts`.  
2. Implement `layout-splittable-panel.component.html` with:
   - A split button whose icon reflects `direction`.  
   - A cyclic render sequence: `DockZonePanelComponent`, separator, `DockZonePanelComponent`, separator..., up to `maxSubRegions`.  
   - Split disablement when `regions.length >= maxSubRegions`.  
3. Add `layout-splittable-panel.component.css` for the wrapper layout and separators.  
4. Extend `src/app/core/state/layout/layout.actions.ts` with split layout actions and pane size actions.  
5. Extend `src/app/core/state/layout/layout.reducer.ts` and `layout.selectors.ts` to persist and restore split layout state.  
6. Update `src/app/shell/shell.component.html` so the primary workspace and bottom panel render through `app-layout-splittable-panel` when split mode is active.  
7. Confirm that each rendered `app-dock-zone-panel` still registers with `DragDropService` for tab reorder and drop behavior.  
8. Add unit tests for `layout-splittable-panel` split button behavior, model emission, and disabled `maxSubRegions`.  
9. Add shell-level verification that split layout state restores correctly from NgRx on startup.

## Acceptance Criteria

- Clicking split on the primary workspace creates a new vertical pane side by side with the existing pane.  
- Clicking split on the bottom panel creates a new horizontal pane stacked with the existing pane.  
- The split button disables once `maxSubRegions` is reached.  
- Pane layout renders cyclically: `DockZonePanelComponent`, separator, `DockZonePanelComponent`, separator....  
- Split configuration is emitted to NgRx and restorable across application sessions.

## Testing Guidance

- Verify `layout-splittable-panel` disables the split button at `maxSubRegions`.  
- Verify the split icon changes correctly for horizontal vs vertical split directions.  
- Verify the `regionsChange` event payload contains the updated pane model.  
- Verify split layout restores from the layout state after shell reload or workspace restore.
