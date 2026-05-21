# Extension Guide: Drag Initiation for Bottom and Secondary Panels

**Context**: Spec `011-tab-drag-drop` implemented drag-and-drop with drag initiation scoped to the **central region tab bar only**. This guide provides the steps to extend drag initiation to the bottom panel and secondary panel tab bars.

## Prerequisites

- `DragDropService` already exists and is fully functional (created in spec 011).
- The service exposes: `startDrag(tab: DraggableTab, sourceRegion: DockZone)`, `onDragMove(pointerX, pointerY)`, `endDrag(targetZone?: DockZone)`, and `cancelDrag()`.
- Interface validation logic (`canDropTo(tab, zone)`) is already implemented in the service.
- Visual feedback (drag ghost, drop zone highlighting, rejection indicators) is already wired up.

## What Needs to Change

### 1. BottomPanelComponent — Add Drag Initiation

**File**: `src/app/shell/components/bottom-panel/bottom-panel.component.ts`

- Inject `DragDropService` into the component constructor.
- Add a `onTabDragStart(event: MouseEvent, tab: PanelTab)` handler on each tab element.
- On `mousedown` (or `pointerdown`), call `dragDropService.startDrag(...)`, passing:
  - A `DraggableTab` constructed from the `PanelTab` metadata.
  - The component's implemented interfaces (check which region interfaces the component implements via `instanceof` or a registration map).
  - `sourceRegion: DockZone.BottomPanel`.
- Add `dragstart` CSS class to the tab element during drag for visual styling.

**Template**: `src/app/shell/components/bottom-panel/bottom-panel.component.html`

- Add `(pointerdown)="onTabDragStart($event, tab)"` to each tab element in the tab bar.
- Add `[class.dragging]="dragDropService.isDragging(tab.id)"` for visual feedback.
- Ensure `draggable="true"` is set on tab elements.

### 2. SecondaryPanelComponent — Add Drag Initiation

**File**: `src/app/shell/components/secondary-panel/secondary-panel.component.ts`

- Same pattern as BottomPanelComponent:
  - Inject `DragDropService`.
  - Add `onTabDragStart(event: MouseEvent, entry: SecondaryPanelEntry)` handler.
  - Call `dragDropService.startDrag(...)` with `sourceRegion: DockZone.SecondaryPanel`.
  - Pass the list of interfaces the component implements (check if it implements `ICentralRegionTab`, `IBottomPanelEntry`, etc.).

**Template**: `src/app/shell/components/secondary-panel/secondary-panel.component.html`

- Add `(pointerdown)="onTabDragStart($event, entry)"` to each entry tab.
- Add `[class.dragging]="dragDropService.isDragging(entry.id)"`.

### 3. TabBarComponent — Already Supports Drag (No Changes Needed)

The central region `TabBarComponent` already has drag initiation wired up from spec 011. No changes needed here.

### 4. Shell-Level Drop Zone Registration

**File**: `src/app/shell/shell.component.ts`

- Ensure the shell registers drop zones for the bottom panel and secondary panel areas on init.
- The `DragDropService` should already know about all `DockZone` values. Verify that `BottomPanel` and `SecondaryPanel` zones are registered as valid drop targets.
- If the drop zone detection uses element references, add `@ViewChild` or template refs for the bottom panel and secondary panel containers.

### 5. Interface Detection for Bottom/Secondary Panel Tabs

When a tab from the bottom panel is dragged, the service needs to know which interfaces its component implements. The approach used in spec 011 was:

```typescript
const implementedInterfaces = this.detectImplementedInterfaces(componentInstance);
```

Ensure this detection works for components registered via `addBottomPanelEntry` and `addSecondaryPanelEntry`. The detection logic should check:

- Does the component implement `ICentralRegionTab`? → Can drop to central region.
- Does the component implement `ISecondaryPanelEntry`? → Can drop to secondary panel.
- Does the component implement `IBottomPanelEntry`? → Can drop to bottom panel (stays in same zone).

### 6. Testing

- Drag a bottom panel tab that also implements `ICentralRegionTab` to the central region tab bar → tab moves.
- Drag a bottom panel tab that does NOT implement `ICentralRegionTab` to the central region → drop rejected.
- Drag a secondary panel tab that implements `IBottomPanelEntry` to the bottom panel → tab moves.
- Drag a secondary panel tab that implements `ICentralRegionTab` to the central region → tab moves.
- Reorder tabs within the bottom panel tab bar (same-region reorder).
- Reorder tabs within the secondary panel tab bar (same-region reorder).

## Notes

- The `ShellManager` methods `removeBottomPanelEntry` and `removeSecondaryPanelEntry` must exist (or be created) to support the unregister-before-reregister lifecycle clarified in spec 011.
- If the bottom panel or secondary panel uses a different tab model (`PanelTab` vs `TabItem`), the `DraggableTab` construction must map the appropriate fields.
- Consider adding a `dragInitiator` property to the `DraggableTab` entity to track which component started the drag (useful for cleanup and logging).
