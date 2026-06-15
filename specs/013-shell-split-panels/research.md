# Research: Shell Split Panels

**Date**: 2026-05-30  
**Feature**: 013-shell-split-panels

## Clarified Design

- `DockZonePanelComponent` remains unchanged and is reused as the rendered pane inside the new `layout-splittable-panel`.  
- `layout-splittable-panel` is the split layout wrapper that manages split direction, pane counts, separators, and emitted model updates.  
- `maxSubRegions` is a property of the wrapper, not the inner dock zone panel.

## Key Findings

- The existing shell architecture already supports multiple `DockZonePanelComponent` instances in the DOM.  
- `DragDropService.registerReorderSource()` is invoked by `DockZonePanelComponent`, so multiple panes can register independently.  
- The layout state slice is the correct persistence boundary for split region configuration because the shell already restores dimensions and visibility from NgRx state.

## Decisions

- Implement split behavior in `layout-splittable-panel` and keep `DockZonePanelComponent` passive.  
- Persist split model updates through NgRx actions and restore them from the existing layout store on shell initialization.  
- Render split panes in a cyclic pattern: `DockZonePanelComponent`, separator, `DockZonePanelComponent`, separator..., per the spec.

## Outcome

No unresolved clarifications remain. The feature design is ready for Phase 1 data-model and implementation planning.
