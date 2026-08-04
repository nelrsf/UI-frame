# Quickstart: CSS Grid Dockzone Resize

## Overview

This document provides a quick start guide for implementing the CSS Grid Dockzone Resize feature, which enables users to resize internal dockzones within the bottom panel and primary workspaces by dragging vertical/horizontal splitters using CSS grid methods.

## Implementation Steps

### Phase 1: Foundation - State Management

1. **Add Zone Resize Actions**: Update `src/app/core/state/layout/layout.actions.ts` with `startZoneResize`, `draftZoneDimension`, `commitZoneDimension`, and `cancelZoneResize` actions.

2. **Extend Layout State**: Update `src/app/core/state/layout/layout.reducer.ts` to include `internalZoneDimensions` state and add reducers for zone resize actions.

3. **Add Layout Selectors**: Update `src/app/core/state/layout/layout.selectors.ts` to select internal zone dimensions.

### Phase 2: Drag Service Integration

4. **Extend ShellSplitterDragService**: Add methods for internal zone dragging (`onInternalZonePointerDown`, `onInternalZonePointerMove`, `onInternalZonePointerUp`, `onInternalZonePointerCancel`).

5. **Implement Draft State**: Add draft dimension state to track resize operations before commit.

### Phase 3: Component Enhancement

6. **Update LayoutSplittablePanelComponent**: Add CSS grid bindings and subscribe to draft dimensions from `ShellSplitterDragService`.

7. **Implement CSS Grid Styles**: Update `layout-splittable-panel.component.css` with CSS grid container classes and resize state classes.

8. **Update Template**: Modify `layout-splittable-panel.component.html` to use CSS grid container and bind draft dimensions to CSS custom properties.

### Phase 4: Testing & Validation

9. **Unit Tests**: Test component state transitions and CSS grid bindings.

10. **Integration Tests**: Test drag interactions and resize operations.

11. **Performance Tests**: Verify >30 FPS during rapid drag operations.

## Testing Steps

1. **Resize Internal Dockzones**: Test dragging splitters in the bottom panel and primary workspaces to verify internal zones resize correctly using CSS grid.

2. **Maintain Existing Functionality**: Verify that existing splitters in the bottom panel and secondary panel continue to function correctly.

3. **Minimum Size Constraints**: Test that resize operations stop at the minimum size constraint (100px width/height).

4. **Rapid Dragging**: Test rapid dragging movements to ensure debouncing/throttling works correctly and prevents excessive state updates.

5. **Two-Zone Resizing**: Test resizing between two internal zones in a panel to verify proper distribution of space.

## Key Files Modified

- `src/app/core/state/layout/layout.actions.ts` - Add zone resize actions
- `src/app/core/state/layout/layout.reducer.ts` - Add internal zone state
- `src/app/shell/services/splitter-drag.service.ts` - Extend for internal zones
- `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts` - Update component state and bindings
- `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.css` - Add CSS grid styles
- `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.html` - Update template with CSS grid bindings