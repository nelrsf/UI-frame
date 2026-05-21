# Quickstart: Tab Drag-and-Drop Development

## Prerequisites

- Node.js 18+ and npm installed
- Angular CLI 19.x available (`ng version` to verify)
- Project dependencies installed (`npm install`)
- Familiarity with the existing codebase: `ShellManager`, `TabBarComponent`, `BottomPanelComponent`, `ShellContent` state

## Architecture Overview

The drag-and-drop feature consists of four main parts:

1. **`DragDropService`** (`src/app/shell/services/drag-drop.service.ts`): Central service managing drag lifecycle, drop zone registration, interface validation, and state coordination.

2. **`DragGhostComponent`** (`src/app/shell/components/drag-ghost/`): Angular component that renders the floating drag ghost overlay during active drag operations.

3. **TabBarComponent changes** (`src/app/shell/components/tab-bar/`): Adds `pointerdown` event handlers to initiate drag operations on tab elements.

4. **State changes** (workspace + shell-content reducers): New actions for `moveTabToZone`, `removeTab`, `removeBottomPanelEntry`, `removeSecondaryPanelEntry`.

## Development Workflow

### 1. Create the models

Create `src/app/core/models/drag-drop.model.ts` with the `DraggableTab`, `DragState`, `DropZoneRegistration`, `RegionInterface`, and `DragPhase` types defined in `data-model.md`.

### 2. Create the DragDropService

Create `src/app/shell/services/drag-drop.service.ts` with:
- `providedIn: 'root'`
- Injectable with `Store` (NgRx) and `Renderer2` dependencies
- Methods: `registerDropZone()`, `unregisterDropZone()`, `registerComponentInterface()`, `startDrag()`, `onDragMove()`, `endDrag()`, `cancelDrag()`
- Observable state: `activeDragState$`, `activeDropZone$`, `dropCompatible$`
- Pointer event handlers that follow the pattern from `shell.component.ts` splitter drag

### 3. Create the DragGhostComponent

Create `src/app/shell/components/drag-ghost/` as a standalone component:
- `position: fixed`, `pointer-events: none`, `z-index: 1000`
- Subscribes to `DragDropService.activeDragState$`
- Renders tab label and icon from `draggedTab`
- Shows compatibility indicator (green check / red X) based on `dropCompatible`

### 4. Update TabBarComponent

Add to `tab-bar.component.ts`:
- Inject `DragDropService`
- Add `onTabPointerDown(event: PointerEvent, tab: TabItem)` method
- Call `dragDropService.startDrag(draggableTab, event)` on pointerdown

Add to `tab-bar.component.html`:
- `(pointerdown)="onTabPointerDown($event, tab)"` on each tab element

### 5. Update ShellComponent

Add to `shell.component.ts`:
- Register drop zones for bottom panel and secondary panel on `ngOnInit`
- Add global `keydown` listener for Escape key to cancel drag
- Add `DragGhostComponent` to template with `*ngIf` based on drag state

### 6. Update ShellManager

Add remove methods:
- `removeTab(tabId: string, groupId: string)`
- `removeBottomPanelEntry(entryId: string)`
- `removeSecondaryPanelEntry(entryId: string)`

### 7. Update NgRx State

Add new actions and reducer handlers as defined in `data-model.md`.

### 8. Run tests

```bash
ng test --include='**/drag-drop*'
ng test --include='**/tab-bar*'
```

## Key Files Reference

| File | Purpose |
|---|---|
| `src/app/core/models/drag-drop.model.ts` | New: Drag data models |
| `src/app/shell/services/drag-drop.service.ts` | New: Central drag service |
| `src/app/shell/components/drag-ghost/` | New: Drag ghost overlay |
| `src/app/shell/components/tab-bar/tab-bar.component.ts` | Modified: Add drag initiation |
| `src/app/shell/shell-manager.service.ts` | Modified: Add remove methods |
| `src/app/shell/shell.component.ts` | Modified: Drop zone registration |
| `src/app/shell/shell.component.html` | Modified: Add ghost overlay |
| `src/app/core/state/workspace/workspace.actions.ts` | Modified: New actions |
| `src/app/core/state/workspace/workspace.reducer.ts` | Modified: New handlers |
| `src/app/core/state/shell-content/shell-content.actions.ts` | Modified: New actions |
| `src/app/core/state/shell-content/shell-content.reducer.ts` | Modified: New handlers |
