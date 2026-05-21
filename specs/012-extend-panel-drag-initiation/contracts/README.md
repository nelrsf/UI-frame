# Contracts: Extend Panel Drag Initiation

**Date**: 2026-05-21  
**Feature**: 012-extend-panel-drag-initiation

## Internal Contracts

This feature does not expose external APIs or interfaces. All contracts are internal to the Angular application:

### DragDropService Interface (Existing, No Changes)

```typescript
interface DragDropService {
  startDrag(tab: DraggableTab, event: PointerEvent): void;
  onDragMove(event: PointerEvent): void;
  endDrag(): void;
  cancelDrag(): void;
  isDragging(): boolean;
  getComponentInterfaces(componentType: Type<unknown>): Set<RegionInterface>;
  registerComponentInterface(componentType: Type<unknown>, interfaceType: RegionInterface): void;
  crossRegionDrop$: Observable<CrossRegionDropPayload>;
}
```

### Component Handler Signatures (New)

```typescript
// BottomPanelComponent
onTabPointerDown(event: PointerEvent, panel: PanelTab): void;

// SecondaryPanelComponent
onEntryPointerDown(event: PointerEvent, entry: SecondaryPanelEntry): void;
```

### NgRx Actions (New)

```typescript
// shell-content.actions.ts
export const reorderBottomPanelTabs = createAction(
  '[ShellContent] Reorder Bottom Panel Tabs',
  props<{ fromIndex: number; toIndex: number }>()
);

export const reorderSecondaryPanelEntries = createAction(
  '[ShellContent] Reorder Secondary Panel Entries',
  props<{ fromIndex: number; toIndex: number }>()
);
```
