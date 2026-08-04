# Implementation Guide: CSS Grid Dockzone Resize

## Overview

This guide provides a step-by-step implementation plan for adding CSS grid-based resize functionality to internal dockzones within the bottom panel and primary workspaces.

---

## Step 1: Extend Layout State for Internal Zones

### 1.1 Add Zone Resize Actions

**File**: `src/app/core/state/layout/layout.actions.ts`

```typescript
import { createAction, props } from '@ngrx/store';

// Existing actions...

// Zone Resize Actions
export const startZoneResize = createAction(
  '[Layout] Start Zone Resize',
  props<{ zoneId: string; direction: 'horizontal' | 'vertical'; initialDimension: number }>()
);

export const draftZoneDimension = createAction(
  '[Layout] Draft Zone Dimension',
  props<{ zoneId: string; draftDimension: number }>()
);

export const commitZoneDimension = createAction(
  '[Layout] Commit Zone Dimension',
  props<{ zoneId: string; committedDimension: number }>()
);

export const cancelZoneResize = createAction('[Layout] Cancel Zone Resize');
```

### 1.2 Extend Layout State Interface

**File**: `src/app/core/state/layout/layout.reducer.ts`

```typescript
export interface LayoutState {
  // Existing state...
  readonly sidebarVisible: boolean;
  readonly sidebarWidth: number;
  readonly bottomPanelVisible: boolean;
  readonly bottomPanelHeight: number;
  readonly activeSidebarItem: string | null;
  readonly secondaryPanelVisible: boolean;
  readonly secondaryPanelWidth: number;
  readonly splitPanelLayout: LayoutSplittableRegionModel | null;
  
  // New state for internal zones
  readonly internalZoneDimensions: Map<string, ZoneDimensionState>;
}

export interface ZoneDimensionState {
  zoneId: string;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const initialLayoutState: LayoutState = {
  // Existing initial state...
  sidebarVisible: true,
  sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
  bottomPanelVisible: false,
  bottomPanelHeight: BOTTOM_PANEL_HEIGHT_DEFAULT,
  activeSidebarItem: null,
  secondaryPanelVisible: false,
  secondaryPanelWidth: SECONDARY_PANEL_WIDTH_DEFAULT,
  splitPanelLayout: null,
  // New internal zone dimensions state
  internalZoneDimensions: new Map<string, ZoneDimensionState>(),
};
```

### 1.3 Add Zone Resize Reducers

**File**: `src/app/core/state/layout/layout.reducer.ts`

```typescript
export const layoutReducer = createReducer(
  initialLayoutState,
  // Existing reducers...
  
  // Zone Resize Reducers
  on(LayoutActions.startZoneResize, (state, { zoneId, direction, initialDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zoneId) || {
      zoneId,
      width: 200,
      height: 200,
      minWidth: 100,
      minHeight: 100,
    };
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zoneId, {
        ...currentDimension,
        [direction === 'horizontal' ? 'width' : 'height']: initialDimension,
      }),
    };
  }),
  
  on(LayoutActions.draftZoneDimension, (state, { zoneId, draftDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zoneId);
    if (!currentDimension) return state;
    
    const isHorizontal = currentDimension.width !== undefined;
    const newDimension = isHorizontal 
      ? Math.min(1000, Math.max(100, draftDimension)) // 100px min, 1000px max
      : Math.min(1000, Math.max(100, draftDimension));
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zoneId, {
        ...currentDimension,
        [isHorizontal ? 'width' : 'height']: newDimension,
      }),
    };
  }),
  
  on(LayoutActions.commitZoneDimension, (state, { zoneId, committedDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zoneId);
    if (!currentDimension) return state;
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zoneId, {
        ...currentDimension,
        width: currentDimension.width !== undefined ? committedDimension : currentDimension.width,
        height: currentDimension.height !== undefined ? committedDimension : currentDimension.height,
      }),
    };
  }),
  
  on(LayoutActions.cancelZoneResize, (state) => {
    // Clear draft dimensions but keep committed dimensions
    return {
      ...state,
      internalZoneDimensions: new Map(
        Array.from(state.internalZoneDimensions.entries()).map(([key, val]) => [
          key,
          { ...val, width: val.width, height: val.height }
        ])
      ),
    };
  }),
);
```

---

## Step 2: Extend ShellSplitterDragService for Internal Zones

**File**: `src/app/shell/services/splitter-drag.service.ts`

```typescript
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShellSplitterDragService implements OnDestroy {
  // Existing bottom and secondary splitter drag state...
  
  // ── Internal zone drag state ────────────────────────────────────────
  private _internalZoneDragActive = false;
  private _internalZoneDragStartPos = 0;
  private _internalZoneDragStartDimension = 0;
  private _internalZoneDragZoneId = '';
  private _internalZoneDragDirection: 'horizontal' | 'vertical' | null = null;

  private readonly _draftInternalZoneDimension$ = new BehaviorSubject<ZoneDraftDimension | null>(null);
  readonly draftInternalZoneDimension$: Observable<ZoneDraftDimension | null> = 
    this._draftInternalZoneDimension$.asObservable();

  private readonly _onInternalZoneDragEnd$ = new Subject<ZoneDimensionCommit>();
  readonly onInternalZoneDragEnd$: Observable<ZoneDimensionCommit> = 
    this._onInternalZoneDragEnd$.asObservable();

  interface ZoneDraftDimension {
    zoneId: string;
    direction: 'horizontal' | 'vertical';
    draftDimension: number;
  }

  interface ZoneDimensionCommit {
    zoneId: string;
    direction: 'horizontal' | 'vertical';
    committedDimension: number;
  }

  // ... existing methods ...

  // ── Internal zone pointer events ────────────────────────────────────

  onInternalZonePointerDown(event: PointerEvent, zoneId: string, direction: 'horizontal' | 'vertical', initialDimension: number): void {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
    this._internalZoneDragActive = true;
    this._internalZoneDragStartPos = direction === 'horizontal' ? event.clientX : event.clientY;
    this._internalZoneDragStartDimension = initialDimension;
    this._internalZoneDragZoneId = zoneId;
    this._internalZoneDragDirection = direction;
  }

  onInternalZonePointerMove(event: PointerEvent): void {
    if (!this._internalZoneDragActive || !this._internalZoneDragDirection) return;
    
    const pos = this._internalZoneDragDirection === 'horizontal' ? event.clientX : event.clientY;
    const delta = this._internalZoneDragStartPos - pos;
    const draft = Math.min(1000, Math.max(100, Math.round(this._internalZoneDragStartDimension + delta)));
    
    this._draftInternalZoneDimension$.next({
      zoneId: this._internalZoneDragZoneId,
      direction: this._internalZoneDragDirection,
      draftDimension: draft,
    });
  }

  onInternalZonePointerUp(event: PointerEvent): void {
    if (!this._internalZoneDragActive) return;
    this._internalZoneDragActive = false;
    
    const pos = this._internalZoneDragDirection === 'horizontal' ? event.clientX : event.clientY;
    const delta = this._internalZoneDragStartPos - pos;
    const committed = Math.min(1000, Math.max(100, Math.round(this._internalZoneDragStartDimension + delta)));
    
    this._draftInternalZoneDimension$.next(null);
    this._onInternalZoneDragEnd$.next({
      zoneId: this._internalZoneDragZoneId,
      direction: this._internalZoneDragDirection!,
      committedDimension: committed,
    });
  }

  onInternalZonePointerCancel(_event: PointerEvent): void {
    if (!this._internalZoneDragActive) return;
    this._internalZoneDragActive = false;
    this._draftInternalZoneDimension$.next(null);
  }

  ngOnDestroy(): void {
    // ... existing completions ...
    this._draftInternalZoneDimension$.complete();
    this._onInternalZoneDragEnd$.complete();
  }
}
```

---

## Step 3: Update LayoutSplittablePanelComponent for CSS Grid

### 3.1 Update Component State

**File**: `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.ts`

```typescript
import { Component, EventEmitter, Input, Output, ViewChildren, QueryList, AfterViewInit, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { forkJoin, map, Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { LayoutSplitDirection } from '../../models/layout-splittable-region.model';
import { ShellSplitterHandleComponent } from '../shell-splitter-handle/shell-splitter-handle.component';
import { DockZonePanelComponent } from '../dock-zone-panel/dock-zone-panel.component';
import { DockZone } from '../../../core/models/dock-zone-assignment.model';
import { DragDropService } from '../../services/drag-drop.service';
import { ShellTab } from '../../contracts/ShellTab';
import {
    moveTabToZone,
    selectActiveIds,
    selectShellTabs,
    selectTab
} from '../../../core/state/workspace';
import {
    startZoneResize,
    draftZoneDimension,
    commitZoneDimension,
    cancelZoneResize
} from '../../../core/state/layout/layout.actions';

interface PanelState {
    visible: boolean;
    zone: DockZone;
    row: number;
    column: number;
}

class DockPanelPayload {
    el: HTMLElement;

    constructor(
        public panel: DockZonePanelComponent,
        public tabs: ShellTab[]
    ) {
        this.el = panel.el.nativeElement as HTMLElement;
    }
}

@Component({
    selector: 'app-layout-splittable-panel',
    imports: [
        NgClass,
        ShellSplitterHandleComponent,
        DockZonePanelComponent,
        AsyncPipe,
    ],
    templateUrl: './layout-splittable-panel.component.html',
    styleUrls: ['./layout-splittable-panel.component.css']
})
export class LayoutSplittablePanelComponent implements OnInit, AfterViewInit {

    private readonly store = inject(Store);
    private readonly dragDropService = inject(DragDropService);
    private readonly splitterDragService = inject(ShellSplitterDragService);

    readonly selectShellTabs$ = this.store.select(selectShellTabs);
    readonly selectActiveIds$ = this.store.select(selectActiveIds);

    @Input() direction: LayoutSplitDirection = 'horizontal';
    @Input() zones: Array<DockZone[]> = [];
    @Input() visible: boolean = true;

    @Input() showVerticalSplitButton: boolean = false;
    @Input() showHorizontalSplitButton: boolean = false;
    @Input() showClose: boolean = true;

    @Output() closePanel: EventEmitter<boolean> = new EventEmitter()

    @ViewChildren(DockZonePanelComponent)
    dockZonePanels!: QueryList<DockZonePanelComponent>;

    panelStates: PanelState[][] = [];
    panels = new Map<DockZone, DockPanelPayload>();
    columns: number = 0;
    rows: number = 0;

    // Draft dimension state for CSS grid
    _draftZoneDimension: { zoneId: string; dimension: number } | null = null;

    get rowsArray() {
        return Array.from({ length: this.rows }, (_, i) => i);
    }

    ngOnInit(): void {
        this.initializePanelsStates();
        this.subscribeToDraftDimensions();
    }

    ngAfterViewInit(): void {
        this.initializePanels();
        this.registerDropZones();
    }

    private subscribeToDraftDimensions(): void {
        this.splitterDragService.draftInternalZoneDimension$
            .subscribe((draft) => {
                if (draft) {
                    this._draftZoneDimension = {
                        zoneId: draft.zoneId,
                        dimension: draft.draftDimension,
                    };
                } else {
                    this._draftZoneDimension = null;
                }
            });

        this.splitterDragService.onInternalZoneDragEnd$
            .subscribe((commit) => {
                this.store.dispatch(commitZoneDimension({
                    zoneId: commit.zoneId,
                    committedDimension: commit.committedDimension,
                }));
            });
    }

    // ... existing methods ...

    onSplitterPointerDown(event: PointerEvent, zoneId: string, direction: 'horizontal' | 'vertical', initialDimension: number): void {
        this.store.dispatch(startZoneResize({ zoneId, direction, initialDimension }));
        this.splitterDragService.onInternalZonePointerDown(event, zoneId, direction, initialDimension);
    }

    onSplitterPointerMove(event: PointerEvent): void {
        this.splitterDragService.onInternalZonePointerMove(event);
    }

    onSplitterPointerUp(event: PointerEvent): void {
        this.splitterDragService.onInternalZonePointerUp(event);
    }

    onSplitterPointerCancel(event: PointerEvent): void {
        this.splitterDragService.onInternalZonePointerCancel(event);
        this.store.dispatch(cancelZoneResize());
    }
}
```

---

## Step 4: Update CSS Grid Layout Styles

**File**: `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.css`

```css
:host {
    overflow: hidden!important;
}

.splitter-container {
    height: 100%;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
}

.layout-splittable-panel {
    width: 100%;
    flex: 1;
    display: inline-flex;
    flex-direction: column;
    overflow: hidden;
}

/* CSS Grid Container for Internal Zones */
.layout-splittable-grid-container {
    display: grid;
    gap: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

/* Horizontal direction (columns) */
.layout-splittable-grid-horizontal {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-auto-columns: 1fr;
}

/* Vertical direction (rows) */
.layout-splittable-grid-vertical {
    grid-template-rows: repeat(auto-fit, minmax(100px, 1fr));
    grid-auto-rows: 1fr;
}

/* Active resize state with draft dimensions */
.layout-splittable-grid-resizing {
    grid-template-columns: var(--zone-1-width, 1fr) var(--zone-2-width, 1fr);
    grid-template-rows: var(--zone-1-height, 1fr) var(--zone-2-height, 1fr);
}

.layout-splittable-row {
    display: inline-flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.layout-splittable-row-wrapper {
    display: inline-flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.splittable-panel-region {
    display: inline-flex; 
    flex: 1;  
    overflow: auto;
}

.hidden {
    display: none!important;
}

.vertical-splitter {
    height: 100%;
    width: 5px;
    cursor: ew-resize;
}

.horizontal-splitter {
    height: 5px;
    width: 100%;
    cursor: ns-resize;
}
```

---

## Step 5: Update Template with CSS Grid Bindings

**File**: `src/app/shell/components/layout-splittable-panel/layout-splittable-panel.component.html`

```html
<div class="splitter-container" [ngClass]="[visible ? '':'hidden']">

    <div class="splitter-toolbar">
        @if(showHorizontalSplitButton){
        <button class="splitter-toolbar-button splitter-toolbar-button__split-h"
            (click)="onSplitPanels($event, 'horizontal')" [ngClass]="[areAllPanelsVisible() ? 'hidden' : '']">
            ↔
        </button>
        }

        @if(showVerticalSplitButton){
        <button class="splitter-toolbar-button splitter-toolbar-button__split-v"
            (click)="onSplitPanels($event, 'vertical')" [ngClass]="[areAllRowsVisible() ? 'hidden' : '']">
            ↕
        </button>
        }

        @if(showClose){
        <button class="splitter-toolbar-button splitter-toolbar-button__close" (click)="handleClosePanel($event)">
            x
        </button>
        }
    </div>

    <!-- CSS Grid Container -->
    <div 
        class="layout-splittable-grid-container"
        [ngClass]="[
            'layout-splittable-grid-' + direction,
            _draftZoneDimension ? 'layout-splittable-grid-resizing' : ''
        ]"
        [style.--zone-1-width]="_draftZoneDimension?.dimension ? _draftZoneDimension.dimension + 'px' : '1fr'"
        [style.--zone-2-width]="_draftZoneDimension?.dimension ? '1fr' : '1fr'"
    >
        @for (row of rowsArray; track $index; let rowIndex = $index) {
        <div class="layout-splittable-row-wrapper" [class.hidden]="!isRowVisible($index)">
            @if($index > 0){
            <app-shell-splitter-handle 
                class="horizontal-splitter" 
                [variant]="'vertical'" 
                testId="splitter-{{$index}}"
                ariaLabel="Resize panel {{$index}}" 
                [ariaOrientation]="direction"
                (pointerDown)="onSplitterPointerDown($event, getZoneForRow(rowIndex), 'vertical', getRowHeight(rowIndex))"
                (pointerMove)="onSplitterPointerMove($event)"
                (pointerUp)="onSplitterPointerUp($event)"
                (pointerCancel)="onSplitterPointerCancel($event)">
            </app-shell-splitter-handle>
            }
            <div class="layout-splittable-row">
                @for (panel of panelStates[rowIndex]; track panel) {

                <div class="splittable-panel-region" [class.hidden]="!isPanelVisible(panel.zone)">

                    @if (hasPreviousColumnEnabled(panel)) {
                    <app-shell-splitter-handle 
                        class="vertical-splitter" 
                        [variant]="'horizontal'"
                        testId="splitter-{{$index}}" 
                        ariaLabel="Resize panel {{$index}}" 
                        [ariaOrientation]="direction"
                        (pointerDown)="onSplitterPointerDown($event, panel.zone, 'horizontal', getColumnWidth(panel.column))"
                        (pointerMove)="onSplitterPointerMove($event)"
                        (pointerUp)="onSplitterPointerUp($event)"
                        (pointerCancel)="onSplitterPointerCancel($event)">
                    </app-shell-splitter-handle>
                    }

                    <app-dock-zone-panel #dockPanel class="splittable-panel-dock-zone" [zone]="panel.zone"
                        [tabs]="(getPanelTabs(panel.zone) | async) ?? []"
                        [activeTabId]="(getActiveTabIdByZone(panel.zone) | async) ?? ''"
                        (activeTabChange)="onActiveTabChanged($event)"
                        [showActions]="!(panel.column==0 && panel.row==0)"
                        (visibilityChange)="onVisivilityChange($event, panel.zone)">
                    </app-dock-zone-panel>

                </div>
                }
            </div>
        </div>
        }
    </div>
</div>
```

---

## Testing Objectives

### Unit Tests
- Test component state transitions for draft vs. committed dimensions
- Test CSS grid property bindings
- Test minimum size constraints (100px minimum)

### Integration Tests
- Test drag interactions and resize operations
- Test CSS grid layout updates during drag
- Test splitter handle event subscriptions

### Performance Tests
- Verify >30 FPS during rapid drag operations
- Verify no visual stuttering or performance issues
- Verify debouncing/throttling prevents excessive state updates