# Quickstart: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Feature**: 012-extend-panel-drag-initiation

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- Angular CLI 18+ available
- Existing UI Frame project with spec 011-tab-drag-drop implemented

## Setup

1. **Ensure you're on the feature branch**:
   ```bash
   git checkout 012-extend-panel-drag-initiation
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Verify existing drag-and-drop works**:
   ```bash
   npm start
   ```
   - Drag a tab in the central region tab bar to verify existing functionality

## Implementation Steps

1. **Add drag initiation to BottomPanelComponent**:
   - Inject `DragDropService` in constructor
   - Add `onTabPointerDown(event: PointerEvent, panel: PanelTab)` handler
   - Update template with `(pointerdown)` binding

2. **Add drag initiation to SecondaryPanelComponent**:
   - Same pattern as BottomPanelComponent
   - Use `DockZone.SecondaryPanel` for `sourceZone`

3. **Add NgRx reorder actions**:
   - Create `reorderBottomPanelTabs` action in `shell-content.actions.ts`
   - Create `reorderSecondaryPanelEntries` action in `shell-content.actions.ts`
   - Add reducer handlers in `shell-content.reducer.ts`

4. **Register reorder sources**:
   - Call `dragDropService.registerReorderSource()` in `BottomPanelComponent.ngAfterViewInit()`
   - Call `dragDropService.registerReorderSource()` in `SecondaryPanelComponent.ngAfterViewInit()`

## Testing

1. **Run unit tests**:
   ```bash
   npm test
   ```

2. **Manual testing**:
   - Start the app: `npm start`
   - Add a bottom panel entry and a secondary panel entry
   - Drag bottom panel tab to central region → should move
   - Drag secondary panel tab to bottom panel → should move (if compatible)
   - Drag within bottom panel → should reorder
   - Press Escape during drag → should cancel

## Verification

- No circular DI errors in console
- Drag threshold (4px) works correctly for all panels
- Visual feedback (ghost, drop zone highlighting) appears during drag
- Cross-region drops update state correctly via NgRx
- Same-region reorders persist after drag completes
