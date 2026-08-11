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
  props<{ zone: DockZone; direction: 'horizontal' | 'vertical'; initialDimension: number }>()
);

export const draftZoneDimension = createAction(
  '[Layout] Draft Zone Dimension',
  props<{ zone: DockZone; draftDimension: number }>()
);

export const commitZoneDimension = createAction(
  '[Layout] Commit Zone Dimension',
  props<{ zone: DockZone; committedDimension: number }>()
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
  readonly internalZoneDimensions: Map<DockZone, ZoneDimensionState>;
}

export interface ZoneDimensionState {
  zone: DockZone;
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
  internalZoneDimensions: new Map<DockZone, ZoneDimensionState>(),
};
```

### 1.3 Add Zone Resize Reducers

**File**: `src/app/core/state/layout/layout.reducer.ts`

```typescript
export const layoutReducer = createReducer(
  initialLayoutState,
  // Existing reducers...
  
  // Zone Resize Reducers
  on(LayoutActions.startZoneResize, (state, { zone, direction, initialDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zone) || {
      zone,
      width: 200,
      height: 200,
      minWidth: 100,
      minHeight: 100,
    };
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zone, {
        ...currentDimension,
        [direction === 'horizontal' ? 'width' : 'height']: initialDimension,
      }),
    };
  }),
  
  on(LayoutActions.draftZoneDimension, (state, { zone, draftDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zone);
    if (!currentDimension) return state;
    
    const isHorizontal = currentDimension.width !== undefined;
    const newDimension = isHorizontal 
      ? Math.min(1000, Math.max(100, draftDimension)) // 100px min, 1000px max
      : Math.min(1000, Math.max(100, draftDimension));
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zone, {
        ...currentDimension,
        [isHorizontal ? 'width' : 'height']: newDimension,
      }),
    };
  }),
  
  on(LayoutActions.commitZoneDimension, (state, { zone, committedDimension }) => {
    const currentDimension = state.internalZoneDimensions.get(zone);
    if (!currentDimension) return state;
    
    return {
      ...state,
      internalZoneDimensions: new Map(state.internalZoneDimensions).set(zone, {
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
import {
  BOTTOM_PANEL_HEIGHT_MIN,
  BOTTOM_PANEL_HEIGHT_MAX,
  SECONDARY_PANEL_WIDTH_MIN,
  SECONDARY_PANEL_WIDTH_MAX,
} from '../../core/state/layout/layout.reducer';
import {
  DragOperation,
  SimpleDragDraft,
  SimpleDragEnd,
  InternalZoneDragDraft,
  InternalZoneDragEnd,
  DragDirection,
} from './splitter-drag-operation';
import { DockZone } from '../../core/models/dock-zone-assignment.model';

@Injectable({
  providedIn: 'root',
})
export class ShellSplitterDragService implements OnDestroy {
  /** Draft height during bottom splitter drag (null = use committed NgRx value). */
  private readonly _draftBottomHeight$ = new BehaviorSubject<number | null>(null);
  /** Draft width during secondary splitter drag (null = use committed NgRx value). */
  private readonly _draftSecondaryWidth$ = new BehaviorSubject<number | null>(null);
  
  /** Draft dimension during internal zone drag */
  private readonly _draftInternalZoneDimension$ = new BehaviorSubject<InternalZoneDragDraft | null>(null);

  readonly draftBottomHeight$: Observable<number | null> = this._draftBottomHeight$.asObservable();
  readonly draftSecondaryWidth$: Observable<number | null> = this._draftSecondaryWidth$.asObservable();
  readonly draftInternalZoneDimension$: Observable<InternalZoneDragDraft | null> = this._draftInternalZoneDimension$.asObservable();

  private readonly _onBottomDragEnd$ = new Subject<number>();
  readonly onBottomDragEnd$: Observable<number> = this._onBottomDragEnd$.asObservable();

  private readonly _onSecondaryDragEnd$ = new Subject<number>();
  readonly onSecondaryDragEnd$: Observable<number> = this._onSecondaryDragEnd$.asObservable();
  
  private readonly _onInternalZoneDragEnd$ = new Subject<InternalZoneDragEnd>();
  readonly onInternalZoneDragEnd$: Observable<InternalZoneDragEnd> = this._onInternalZoneDragEnd$.asObservable();

  // Simple drag operations (bottom & secondary panels)
  private readonly _bottomDragOp = new DragOperation<number, number>(
    BOTTOM_PANEL_HEIGHT_MIN,
    BOTTOM_PANEL_HEIGHT_MAX,
    this._draftBottomHeight$,
    this._onBottomDragEnd$,
    'vertical' // vertical for bottom panel
  );

  private readonly _secondaryDragOp = new DragOperation<number, number>(
    SECONDARY_PANEL_WIDTH_MIN,
    SECONDARY_PANEL_WIDTH_MAX,
    this._draftSecondaryWidth$,
    this._onSecondaryDragEnd$,
    'horizontal' // horizontal for secondary panel
  );

  // Internal zone drag operation (dynamic direction)
  private readonly _internalZoneDragOp = new DragOperation<
    InternalZoneDragDraft,
    InternalZoneDragEnd
  >(
    100, // minDimension
    1000, // maxDimension
    this._draftInternalZoneDimension$,
    this._onInternalZoneDragEnd$,
    undefined, // dynamic direction for internal zones
    true // isInternalZoneDrag
  );

  ngOnDestroy(): void {
    this._bottomDragOp.complete();
    this._secondaryDragOp.complete();
    this._internalZoneDragOp.complete();
  }

  // ── Bottom splitter pointer events ────────────────────────────────────────

  onBottomSplitterPointerDown(event: PointerEvent, committedHeight: number): void {
    this._bottomDragOp.onPointerDown(event, committedHeight);
  }

  onBottomSplitterPointerMove(event: PointerEvent): void {
    this._bottomDragOp.onPointerMove(event);
  }

  onBottomSplitterPointerUp(event: PointerEvent): void {
    this._bottomDragOp.onPointerUp(event);
  }

  onBottomSplitterPointerCancel(_event: PointerEvent): void {
    this._bottomDragOp.onPointerCancel(_event);
  }

  // ── Secondary splitter pointer events ─────────────────────────────────────

  onSecondarySplitterPointerDown(event: PointerEvent, committedWidth: number): void {
    this._secondaryDragOp.onPointerDown(event, committedWidth);
  }

  onSecondarySplitterPointerMove(event: PointerEvent): void {
    this._secondaryDragOp.onPointerMove(event);
  }

  onSecondarySplitterPointerUp(event: PointerEvent): void {
    this._secondaryDragOp.onPointerUp(event);
  }

  onSecondarySplitterPointerCancel(_event: PointerEvent): void {
    this._secondaryDragOp.onPointerCancel(_event);
  }

  // ── Internal zone splitter pointer events ─────────────────────────────────

  onInternalZonePointerDown(event: PointerEvent, zone: DockZone, direction: DragDirection, initialDimension: number): void {
    this._internalZoneDragOp.onPointerDown(event, initialDimension, zone, direction);
  }

  onInternalZonePointerMove(event: PointerEvent): void {
    this._internalZoneDragOp.onPointerMove(event);
  }

  onInternalZonePointerUp(event: PointerEvent): void {
    this._internalZoneDragOp.onPointerUp(event);
  }

  onInternalZonePointerCancel(_event: PointerEvent): void {
    this._internalZoneDragOp.onPointerCancel(_event);
  }
}
```

---

## Step 3: Update LayoutSplittablePanelComponent for Internal Zone Resize

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
import { ShellSplitterDragService } from '../../services/splitter-drag.service';
import { InternalZoneDragDraft, InternalZoneDragEnd, DragDirection } from '../../services/splitter-drag-operation';

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

    // Draft dimension state for internal zone resize
    _draftInternalZoneDimension: InternalZoneDragDraft | null = null;

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
                this._draftInternalZoneDimension = draft;
            });

        this.splitterDragService.onInternalZoneDragEnd$
            .subscribe((commit) => {
                this.store.dispatch(commitZoneDimension({
                    zone: commit.zone,
                    committedDimension: commit.committedDimension,
                }));
            });
    }

    // ... existing methods ...

    onSplitterPointerDown(event: PointerEvent, zone: DockZone, direction: DragDirection, initialDimension: number): void {
        this.store.dispatch(startZoneResize({ zone, direction, initialDimension }));
        this.splitterDragService.onInternalZonePointerDown(event, zone, direction, initialDimension);
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

## Step 4: Update Template with Internal Zone Pointer Events

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

    <div class="layout-splittable-panel">
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

                <div class="splittable-panel-region" [class.hidden]="!isPanelVisible(panel.zone)"
                    [style.width]="_draftInternalZoneDimension?.zone === panel.zone && _draftInternalZoneDimension?.direction === 'horizontal' ? _draftInternalZoneDimension.draftDimension + 'px' : ''"
                    [style.flex]="_draftInternalZoneDimension?.zone === panel.zone && _draftInternalZoneDimension?.direction === 'horizontal' ? '0 0 ' + _draftInternalZoneDimension.draftDimension + 'px' : '1'">

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
- Verify resize operations respect minimum and maximum size constraints (100px minimum, 1000px maximum)
- Verify dynamic layout with flexbox correctly applies draft dimensions to the specific zone being resized