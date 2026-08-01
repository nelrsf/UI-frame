import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import {
  BOTTOM_PANEL_HEIGHT_MIN,
  BOTTOM_PANEL_HEIGHT_MAX,
  SECONDARY_PANEL_WIDTH_MIN,
  SECONDARY_PANEL_WIDTH_MAX,
} from '../../core/state/layout/layout.reducer';

@Injectable({
  providedIn: 'root',
})
export class ShellSplitterDragService implements OnDestroy {
  private _bottomDragActive = false;
  private _bottomDragStartY = 0;
  private _bottomDragStartHeight = 0;

  private _secondaryDragActive = false;
  private _secondaryDragStartX = 0;
  private _secondaryDragStartWidth = 0;

  /** Draft height during bottom splitter drag (null = use committed NgRx value). */
  private readonly _draftBottomHeight$ = new BehaviorSubject<number | null>(null);
  /** Draft width during secondary splitter drag (null = use committed NgRx value). */
  private readonly _draftSecondaryWidth$ = new BehaviorSubject<number | null>(null);

  readonly draftBottomHeight$: Observable<number | null> = this._draftBottomHeight$.asObservable();
  readonly draftSecondaryWidth$: Observable<number | null> = this._draftSecondaryWidth$.asObservable();

  private readonly _onBottomDragEnd$ = new Subject<number>();
  readonly onBottomDragEnd$: Observable<number> = this._onBottomDragEnd$.asObservable();

  private readonly _onSecondaryDragEnd$ = new Subject<number>();
  readonly onSecondaryDragEnd$: Observable<number> = this._onSecondaryDragEnd$.asObservable();

  ngOnDestroy(): void {
    this._draftBottomHeight$.complete();
    this._draftSecondaryWidth$.complete();
    this._onBottomDragEnd$.complete();
    this._onSecondaryDragEnd$.complete();
  }

  // ── Bottom splitter pointer events ────────────────────────────────────────

  onBottomSplitterPointerDown(event: PointerEvent, committedHeight: number): void {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
    this._bottomDragActive = true;
    this._bottomDragStartY = event.clientY;
    this._bottomDragStartHeight = committedHeight;
  }

  onBottomSplitterPointerMove(event: PointerEvent): void {
    if (!this._bottomDragActive) return;
    const delta = this._bottomDragStartY - event.clientY;
    const draft = Math.min(BOTTOM_PANEL_HEIGHT_MAX, Math.max(BOTTOM_PANEL_HEIGHT_MIN, Math.round(this._bottomDragStartHeight + delta)));
    this._draftBottomHeight$.next(draft);
  }

  onBottomSplitterPointerUp(event: PointerEvent): void {
    if (!this._bottomDragActive) return;
    this._bottomDragActive = false;
    const delta = this._bottomDragStartY - event.clientY;
    const committed = Math.min(BOTTOM_PANEL_HEIGHT_MAX, Math.max(BOTTOM_PANEL_HEIGHT_MIN, Math.round(this._bottomDragStartHeight + delta)));
    this._draftBottomHeight$.next(null);
    this._onBottomDragEnd$.next(committed);
  }

  onBottomSplitterPointerCancel(_event: PointerEvent): void {
    if (!this._bottomDragActive) return;
    this._bottomDragActive = false;
    this._draftBottomHeight$.next(null);
  }

  // ── Secondary splitter pointer events ─────────────────────────────────────

  onSecondarySplitterPointerDown(event: PointerEvent, committedWidth: number): void {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
    this._secondaryDragActive = true;
    this._secondaryDragStartX = event.clientX;
    this._secondaryDragStartWidth = committedWidth;
  }

  onSecondarySplitterPointerMove(event: PointerEvent): void {
    if (!this._secondaryDragActive) return;
    const delta = this._secondaryDragStartX - event.clientX;
    const draft = Math.min(SECONDARY_PANEL_WIDTH_MAX, Math.max(SECONDARY_PANEL_WIDTH_MIN, Math.round(this._secondaryDragStartWidth + delta)));
    this._draftSecondaryWidth$.next(draft);
  }

  onSecondarySplitterPointerUp(event: PointerEvent): void {
    if (!this._secondaryDragActive) return;
    this._secondaryDragActive = false;
    const delta = this._secondaryDragStartX - event.clientX;
    const committed = Math.min(SECONDARY_PANEL_WIDTH_MAX, Math.max(SECONDARY_PANEL_WIDTH_MIN, Math.round(this._secondaryDragStartWidth + delta)));
    this._draftSecondaryWidth$.next(null);
    this._onSecondaryDragEnd$.next(committed);
  }

  onSecondarySplitterPointerCancel(_event: PointerEvent): void {
    if (!this._secondaryDragActive) return;
    this._secondaryDragActive = false;
    this._draftSecondaryWidth$.next(null);
  }
}
