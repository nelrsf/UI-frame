# Internal Contracts: Tab Drag-and-Drop

## ShellManager Remove Methods

These methods are added to `ShellManager` to support the unregister-before-reregister lifecycle for cross-region tab movement.

### removeTab

```typescript
removeTab(tabId: string, groupId: string): void
```

**Parameters**:
- `tabId`: The unique identifier of the tab to remove
- `groupId`: The tab group ID containing the tab

**Behavior**:
1. Removes the tab from the internal tracking `Set<string>`
2. Dispatches `[Workspace] Remove Tab` action with `{ tabId, groupId }`
3. The reducer removes the tab from both `tabs` and `registeredTabs` arrays

**Preconditions**: The tab must exist in the specified group's registry.

---

### removeBottomPanelEntry

```typescript
removeBottomPanelEntry(entryId: string): void
```

**Parameters**:
- `entryId`: The unique identifier of the bottom panel entry to remove

**Behavior**:
1. Removes the entry from the internal tracking `Set<string>`
2. Dispatches `[ShellContent] Remove Bottom Panel Entry` action with `{ entryId }`
3. The reducer removes the entry from `bottomPanelTabs` array

**Preconditions**: The entry must exist in the bottom panel registry.

---

### removeSecondaryPanelEntry

```typescript
removeSecondaryPanelEntry(entryId: string): void
```

**Parameters**:
- `entryId`: The unique identifier of the secondary panel entry to remove

**Behavior**:
1. Removes the entry from the internal tracking `Set<string>`
2. Dispatches `[ShellContent] Remove Secondary Panel Entry` action with `{ entryId }`
3. The reducer removes the entry from `secondaryPanelEntries` array

**Preconditions**: The entry must exist in the secondary panel registry.

---

## DragDropService Interface

```typescript
@Injectable({ providedIn: 'root' })
export class DragDropService {
  // Observables
  readonly activeDragState$: Observable<DragState | null>;
  readonly activeDropZone$: Observable<DockZone | null>;
  readonly dropCompatible$: Observable<boolean>;

  // Drop zone management
  registerDropZone(zone: DockZone, element: HTMLElement, requiredInterface: RegionInterface): void;
  unregisterDropZone(zone: DockZone): void;

  // Component interface registration
  registerComponentInterface(componentType: Type<unknown>, interfaceType: RegionInterface): void;

  // Drag lifecycle
  startDrag(tab: DraggableTab, event: PointerEvent): void;
  onDragMove(event: PointerEvent): void;
  endDrag(): void;
  cancelDrag(): void;
}
```

---

## NgRx Actions

### Workspace Actions

```typescript
export const moveTabToZone = createAction(
  '[Workspace] Move Tab To Zone',
  props<{
    tabId: string;
    sourceGroupId: string;
    sourceZone: DockZone;
    targetZone: DockZone;
    tabMetadata: TabItem;
  }>()
);

export const removeTab = createAction(
  '[Workspace] Remove Tab',
  props<{ tabId: string; groupId: string }>()
);
```

### ShellContent Actions

```typescript
export const removeBottomPanelEntry = createAction(
  '[ShellContent] Remove Bottom Panel Entry',
  props<{ entryId: string }>()
);

export const removeSecondaryPanelEntry = createAction(
  '[ShellContent] Remove Secondary Panel Entry',
  props<{ entryId: string }>()
);
```
