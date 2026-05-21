# Extension Guide: Drag Initiation for Bottom and Secondary Panels

**Context**: Spec `011-tab-drag-drop` implemented drag-and-drop with drag initiation scoped to the **central region tab bar only**. This guide provides the steps to extend drag initiation to the bottom panel and secondary panel tab bars.

## Prerequisites

- `DragDropService` already exists at `src/app/shell/services/drag-drop.service.ts` and is fully functional.
- The service uses **pointer events** (not HTML5 Drag and Drop API).
- Key service methods:
  - `startDrag(tab: DraggableTab, event: PointerEvent)` — initiates a potential drag (only becomes active after 4px movement threshold).
  - `onDragMove(event: PointerEvent)` — called on global `pointermove`; detects drop zones and evaluates compatibility.
  - `endDrag()` — called on global `pointerup`; evaluates drop and executes cross-region move or same-region reorder.
  - `cancelDrag()` — aborts the drag without changes.
  - `isDragging(): boolean` — returns true if a drag is currently active (past the 4px threshold).
  - `getComponentInterfaces(componentType: Type<unknown>): Set<RegionInterface>` — returns registered interfaces for a component type.
  - `registerComponentInterface(componentType: Type<unknown>, interfaceType: RegionInterface)` — registers which interfaces a component implements.
- The service emits `crossRegionDrop$: Observable<CrossRegionDropPayload>` when a cross-region drop succeeds. `ShellComponent` subscribes to this and calls `ShellManager` methods to register the tab in the target region.
- Interface validation is handled internally by `_detectDropZone()` — no public `canDropTo` method exists.
- Visual feedback (drag ghost via `DragGhostComponent`, drop zone CSS class toggling) is already wired up.
- `ShellManager` uses `Injector.get(DragDropService)` for lazy resolution to avoid circular DI. The `removeTab`, `removeBottomPanelEntry`, and `removeSecondaryPanelEntry` methods already exist.

## What Needs to Change

### 1. BottomPanelComponent — Add Drag Initiation

**File**: `src/app/shell/components/bottom-panel/bottom-panel.component.ts`

- Inject `DragDropService` into the component constructor.
- Add an `onTabPointerDown(event: PointerEvent, panel: PanelTab)` handler.
- On `pointerdown` (only left button, `event.button === 0`):
  1. Get the component's registered interfaces: `this.dragDropService.getComponentInterfaces(panel.component)`.
  2. Construct a `DraggableTab`:
     ```typescript
     const draggableTab: DraggableTab = {
       id: panel.id,
       label: panel.label,
       icon: panel.icon,
       componentType: panel.component,
       implementedInterfaces: componentInterfaces,
       sourceZone: DockZone.BottomPanel,
       sourceGroupId: '',  // Bottom panel tabs don't have a groupId; use empty string
       pinned: false,       // Bottom panel entries are not pinned
       dirty: false,        // Bottom panel entries are not dirty
       closable: panel.closable,
     };
     ```
  3. Call `this.dragDropService.startDrag(draggableTab, event)`.

**Template**: `src/app/shell/components/bottom-panel/bottom-panel.component.html`

- Add `(pointerdown)="onTabPointerDown($event, panel)"` to each tab/panel element in the tab bar.
- No `draggable="true"` attribute needed — pointer events handle everything.
- Optional: Add `[class.dragging]="dragDropService.isDragging()"` to the tab element for visual feedback during drag.

### 2. SecondaryPanelComponent — Add Drag Initiation

**File**: `src/app/shell/components/secondary-panel/secondary-panel.component.ts`

- Same pattern as BottomPanelComponent:
  - Inject `DragDropService`.
  - Add `onEntryPointerDown(event: PointerEvent, entry: SecondaryPanelEntry)` handler.
  - Construct `DraggableTab` with `sourceZone: DockZone.SecondaryPanel`.
  - Call `this.dragDropService.startDrag(draggableTab, event)`.

**Template**: `src/app/shell/components/secondary-panel/secondary-panel.component.html`

- Add `(pointerdown)="onEntryPointerDown($event, entry)"` to each entry tab element.

### 3. TabBarComponent — Already Supports Drag (No Changes Needed)

The central region `TabBarComponent` already has drag initiation wired up from spec 011. It also handles same-region reorder via `registerReorderSource()` callback.

### 4. Shell-Level Drop Zone Registration — Already Done (No Changes Needed)

`ShellComponent._registerDropZones()` already registers `BottomPanel` and `SecondaryPanel` as drop zones in `ngAfterViewInit`. The drop zone elements are queried via `querySelector('.shell-bottom-panel')` and `querySelector('.shell-secondary-panel')`.

**However**, when dragging FROM bottom/secondary panels, the service needs to know that the source zone is `BottomPanel` or `SecondaryPanel` (not `PrimaryWorkspace`). This is handled by setting `sourceZone` in the `DraggableTab` constructed in steps 1 and 2 above. The `_detectDropZone` method in `DragDropService` already compares `activeDropZone === draggedTab.sourceZone` to reject same-zone drops (which triggers same-region reorder logic instead).

### 5. Interface Detection for Bottom/Secondary Panel Tabs

Interface registration is already handled by `ShellManager` via `Injector` lazy resolution:

- When `ShellManager.addBottomPanelEntry(panel)` is called, it calls `this.dragDropService.registerComponentInterface(panel.component, RegionInterface.BottomPanelEntry)`.
- When `ShellManager.addSecondaryPanelEntry(entry)` is called, it calls `this.dragDropService.registerComponentInterface(entry.component, RegionInterface.SecondaryPanelEntry)`.

**No additional interface detection code is needed.** The `DraggableTab` constructed in steps 1 and 2 simply calls `this.dragDropService.getComponentInterfaces(component)` to get the already-registered interfaces.

**What to verify**: If a component implements multiple interfaces (e.g., a component that implements both `IBottomPanelEntry` and `ICentralRegionTab`), ensure that `ShellManager` registers ALL applicable interfaces. Currently, `addBottomPanelEntry` only registers `RegionInterface.BottomPanelEntry`. If a component should be droppable in multiple regions, the registration call should include all applicable interfaces. This may require a new method or parameter in `ShellManager` to register multiple interfaces at once.

### 6. Cross-Region Drop Handling — Already Done (No Changes Needed)

When a tab from the bottom panel is dropped onto the central region tab bar:

1. `DragDropService.endDrag()` detects the drop zone is `PrimaryWorkspace` and is compatible.
2. It dispatches `moveTabToZone` action (which removes the tab from the source group in workspace state).
3. It emits `crossRegionDrop$` with the drop payload.
4. `ShellComponent` subscribes to `crossRegionDrop$` and calls `ShellManager.addBottomPanelEntry()` or `ShellManager.addSecondaryPanelEntry()` based on `targetZone`.

**For bottom → central or secondary → central drops**: The `moveTabToZone` reducer handler adds the tab to the workspace state (since `targetZone === PrimaryWorkspace`). The `crossRegionDrop$` event is still emitted but `ShellComponent` only calls `addBottomPanelEntry` or `addSecondaryPanelEntry` for those zones — it does nothing for `PrimaryWorkspace` target. This is correct behavior.

**For bottom → secondary or secondary → bottom drops**: The `moveTabToZone` reducer removes the tab from the source workspace group. The `crossRegionDrop$` event triggers `ShellComponent` to call the appropriate `ShellManager.addXxxEntry()` method to register in the target region.

### 7. Same-Region Reorder for Bottom/Secondary Panels

The current reorder logic in `DragDropService` uses `registerReorderSource()` with a callback that dispatches `reorderTab` action. This is specific to the central region tab bar.

For bottom panel and secondary panel reorder, you have two options:

**Option A**: Add `registerReorderSource()` calls in `BottomPanelComponent` and `SecondaryPanelComponent`, similar to `TabBarComponent`. Each component would need its own reorder callback that dispatches a zone-specific reorder action (or a generic one with a `zone` parameter).

**Option B**: Reuse the existing `reorderTab` action by treating bottom panel tabs and secondary panel entries as part of a virtual tab group. This requires mapping `PanelTab` / `SecondaryPanelEntry` to `TabItem` and vice versa.

**Recommendation**: Option A is cleaner. Create new NgRx actions:
- `[ShellContent] Reorder Bottom Panel Tabs` with `{ fromIndex: number; toIndex: number }`
- `[ShellContent] Reorder Secondary Panel Entries` with `{ fromIndex: number; toIndex: number }`

Then add corresponding reducer handlers in `shell-content.reducer.ts`.

### 8. Testing

**Cross-region drag tests**:
- Drag a bottom panel tab that also implements `ICentralRegionTab` to the central region tab bar → tab moves to central region.
- Drag a bottom panel tab that does NOT implement `ICentralRegionTab` to the central region → drop rejected, visual feedback shows rejection.
- Drag a secondary panel tab that implements `IBottomPanelEntry` to the bottom panel → tab moves to bottom panel.
- Drag a secondary panel tab that implements `ICentralRegionTab` to the central region → tab moves to central region.

**Same-region reorder tests**:
- Drag a bottom panel tab from position 2 to position 0 within the bottom panel tab bar → order changes.
- Drag a secondary panel entry from position 1 to position 3 within the secondary panel → order changes.

**Edge case tests**:
- Drag a bottom panel tab outside any drop zone → drag cancelled, tab remains.
- Press Escape while dragging a bottom panel tab → drag cancelled.
- Drag the only tab in the bottom panel to the central region → bottom panel tab bar becomes empty.

## Important Implementation Notes

1. **Circular DI**: `ShellManager` uses `Injector.get(DragDropService)` for lazy resolution. Do NOT inject `DragDropService` directly in `ShellManager`'s constructor — this causes `NG0200: Circular dependency in DI detected`.

2. **Drag threshold**: Drag only starts after the pointer moves **4px** from the initial click position. Normal clicks (select, close) work without triggering drag. This threshold is defined as `DRAG_THRESHOLD = 4` in `DragDropService`.

3. **DragGhostComponent**: Uses `AsyncPipe` with `ChangeDetectionStrategy.OnPush`. The component is rendered **outside** `.shell-root` in `shell.component.html` to avoid `overflow: hidden` clipping.

4. **CrossRegionDropPayload**: The `sourceGroupId` field may be empty string for bottom/secondary panel tabs since they don't belong to a workspace tab group. The `moveTabToZone` reducer handles this gracefully.

5. **Source zone for same-zone drop rejection**: When dragging within the same region (e.g., bottom → bottom), `_detectDropZone` returns the same zone as `sourceZone`. The service sets `activeDropZone = null` and `dropCompatible = false` in this case, which prevents a cross-region drop and allows the same-region reorder logic to take over.
