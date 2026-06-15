# Research: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Updated**: 2026-06-14
**Feature**: 012-extend-panel-drag-initiation

## Technical Context Resolution

The original plan assumed separate bottom and secondary panel components plus zone-specific reorder actions. The current codebase has since consolidated tab rendering into a generic dock-zone panel and split the workspace/bottom panel into multiple dock zones. This research record is updated to align future work with the implementation that exists now.

### Dock-Zone Tab Surface

- **Decision**: Use `DockZonePanelComponent` as the drag initiation surface for every tabbed dock zone.
- **Rationale**: The current shell renders primary workspace, bottom panel, and secondary panel tabs through the same component. Adding separate bottom/secondary handlers would duplicate behavior and reintroduce obsolete components.
- **Alternatives considered**:
  - Recreate `BottomPanelComponent` and `SecondaryPanelComponent` handlers - rejected because those are no longer the active tab-bar surfaces.
  - Add separate wrapper handlers per zone - rejected because `DockZonePanelComponent` already has the zone context and tab model.

### DragDropService Architecture

- **Decision**: Reuse `DragDropService` for pointer tracking, threshold detection, drop-zone detection, visual feedback, cross-zone moves, and same-zone reorders.
- **Rationale**: The service already centralizes drag lifecycle behavior and dispatches NgRx workspace actions. This preserves consistent behavior across dock zones.
- **Alternatives considered**:
  - Create a panel-specific drag service - rejected due to duplicated state and inconsistent UX.
  - Use HTML5 Drag and Drop - rejected because existing shell drag behavior uses pointer events.

### Compatibility Model

- **Decision**: Use `ShellTab.draggable.allowableDropTargets` as the compatibility source.
- **Rationale**: The current implementation stores allowed dock-zone targets on each draggable tab. A separate `RegionInterface` registry is not present in the active code path.
- **Alternatives considered**:
  - Restore a `RegionInterface` registry - rejected because it would create a parallel compatibility model.

### Same-Zone Reorder Implementation

- **Decision**: Use the generic `reorderTab` NgRx action with `zone`, `toIndex`, and `reorderedTab`.
- **Rationale**: The current state model stores ordered tabs by `DockZone`, so one action can reorder tabs in primary, bottom, and secondary zones.
- **Alternatives considered**:
  - Create `reorderBottomPanelTabs` and `reorderSecondaryPanelEntries` - rejected because zone-specific arrays/actions no longer match the state model.
  - Use component-local state - rejected because persistent tab order must flow through NgRx.

### Persistence Boundary

- **Decision**: Persist successful move/reorder outcomes through the existing workspace-session mechanism.
- **Rationale**: Runtime tab membership and order live in NgRx workspace state, while `WorkspaceSessionService` already provides versioned, workspace-scoped persistence. Connecting these avoids a second storage path and satisfies the shell persistence contract.
- **Alternatives considered**:
  - Persist directly from `DragDropService` - rejected because drag lifecycle code should not own session serialization.
  - Persist only layout dimensions - rejected because users expect tab organization changes to survive reload.

### Restore Strategy

- **Decision**: Restore layout and workspace tab membership during shell initialization from a valid `WorkspaceSession`.
- **Rationale**: Shell startup already restores layout dimensions. Restoring tab membership/order alongside layout keeps the workspace coherent.
- **Open implementation choice**: The restore action payload shape can be a descriptor list or prebuilt `tabsByZone`; choose the shape that best fits existing tab reconstruction/factory mechanisms during implementation.

## Performance Considerations

- Pointer event handlers are lightweight and only activate on primary-button pointerdown.
- Drag threshold remains 4px to avoid accidental drags during selection/close interactions.
- Drag ghost and drop-zone highlighting must remain visible within 50ms after threshold crossing.
- Session save should occur after successful move/reorder outcomes and should not run on every pointermove.
- Restore should ignore invalid persisted data quickly and fall back to safe defaults.

## Testing Strategy

- Unit tests for `DockZonePanelComponent.onTabPointerDown` and template pointerdown binding.
- Unit tests for `DragDropService` compatibility detection, cancellation, cross-zone move dispatch, and same-zone reorder dispatch.
- Reducer tests for `moveTabToZone`, `reorderTab`, and workspace tab restore.
- Workspace-session tests for moved/reordered tab snapshots, corrupt data, schema mismatch, duplicate descriptors, and unavailable tab descriptors.
- Shell integration tests for save/restore after a cross-zone move plus same-zone reorder.
