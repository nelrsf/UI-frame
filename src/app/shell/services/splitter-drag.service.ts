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