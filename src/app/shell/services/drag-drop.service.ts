import { Injectable, NgZone, Type, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from '../../core/state/app.state';
import { DockZone } from '../../core/models/dock-zone-assignment.model';
import {
  DragPhase,
  DragState,
  DropZoneRegistration
} from '../../core/models/drag-drop.model';
import { moveTabToZone } from '../../core/state/workspace';
import { ShellTab } from '../contracts/ShellTab';
import { WithCloseable, WithDraggable, WithPinnable } from '../models/tab-item.model';
import { isTabCloseable, isTabPinnable } from '../common/ShellTabGuardTypes';

/**
 * Payload emitted when a cross-region drop succeeds.
 * The subscriber (ShellComponent) is responsible for calling ShellManager
 * to register the tab in the target region.
 */
export interface CrossRegionDropPayload {
  tabId: string;
  label: string;
  icon?: string;
  componentType: Type<unknown>;
  sourceGroupId: string;
  sourceZone: DockZone;
  targetZone: DockZone;
  pinned: boolean;
  dirty: boolean;
}

/**
 * Central service that manages the lifecycle of drag-and-drop operations
 * across all shell regions.
 *
 * Uses native pointer events (not HTML5 Drag and Drop API) for consistency
 * with the existing splitter drag implementation in ShellComponent.
 *
 * Does NOT depend on ShellManager to avoid circular DI. Instead, it emits
 * a `crossRegionDrop$` event that ShellComponent handles.
 */
@Injectable({ providedIn: 'root' })
export class DragDropService implements OnDestroy {
  private readonly _dragState$ = new BehaviorSubject<DragState>({
    phase: DragPhase.Idle,
    draggedTab: null,
    pointerX: 0,
    pointerY: 0,
    activeDropZone: null,
    dropCompatible: false,
    pointerId: null,
  });

  private readonly _dropZones = new Map<DockZone, DropZoneRegistration>();
  private _previousDropZone: DockZone | null = null;

  private _globalCleanup: (() => void) | null = null;

  // Reorder source registration — supports multiple tab bars (central, bottom, secondary)
  private _reorderSources = new Map<HTMLElement, (fromIndex: number, toIndex: number) => void>();
  private _reorderTargetIndex: number | null = null;
  private _reorderTargetElement: HTMLElement | null = null;

  // Drag threshold — only start dragging after pointer moves this many pixels
  private readonly DRAG_THRESHOLD = 4;
  private _dragStartX = 0;
  private _dragStartY = 0;

  // Cross-region drop event (avoids circular DI with ShellManager)
  private readonly _crossRegionDrop$ = new Subject<CrossRegionDropPayload>();
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store<AppState>,
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._globalCleanup?.();
  }

  // ── Public Observables ─────────────────────────────────────────────────────

  /** Observable of the current drag state (null when idle). */
  readonly activeDragState$: Observable<DragState | null> = this._dragState$.pipe(
    map((state) => (state.phase === DragPhase.Idle ? null : state))
  );

  /** Observable of the currently active drop zone. */
  readonly activeDropZone$: Observable<DockZone | null> = this._dragState$.pipe(
    map((state) => state.activeDropZone)
  );

  /** Observable of whether the active drop zone is compatible with the dragged tab. */
  readonly dropCompatible$: Observable<boolean> = this._dragState$.pipe(
    map((state) => state.dropCompatible)
  );

  /**
   * Observable that emits when a cross-region drop succeeds.
   * Subscribers must call ShellManager to register the tab in the target region.
   */
  readonly crossRegionDrop$: Observable<CrossRegionDropPayload> = this._crossRegionDrop$.asObservable();

  // ── Drop Zone Management ───────────────────────────────────────────────────

  /**
   * Registers a drop zone that can accept dragged tabs.
   */
  registerDropZone(
    zone: DockZone,
    element: HTMLElement
  ): void {
    this._dropZones.set(zone, {
      zone,
      element,
      boundingRect: null,
    });
  }

  /**
   * Unregisters a drop zone.
   */
  unregisterDropZone(zone: DockZone): void {
    this._dropZones.delete(zone);
  }

  /**
   * Registers a tab bar element as a reorder source.
   * When a tab is dropped back onto its source tab bar at a different position,
   * the callback is invoked with the from/to indices.
   * Multiple tab bars can be registered (central, bottom, secondary).
   */
  registerReorderSource(
    element: HTMLElement,
    callback: (fromIndex: number, toIndex: number) => void
  ): void {
    this._reorderSources.set(element, callback);
  }

  // ── Drag Lifecycle ─────────────────────────────────────────────────────────

  /**
   * Starts a potential drag operation for the given tab.
   * Must be called from a pointerdown event handler.
   * The drag only becomes active after the pointer moves DRAG_THRESHOLD pixels.
   */
  startDrag(tab: ShellTab & WithDraggable, event: PointerEvent): void {
    const target = event.target as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    event.preventDefault();

    this._dragStartX = event.clientX;
    this._dragStartY = event.clientY;

    this._setupGlobalListeners();

    // Start in Idle phase — only transitions to Dragging after threshold is met.
    this._dragState$.next({
      phase: DragPhase.Idle,
      draggedTab: tab,
      pointerX: event.clientX,
      pointerY: event.clientY,
      activeDropZone: null,
      dropCompatible: false,
      pointerId: event.pointerId,
    });
  }

  /**
   * Handles pointer movement during a potential or active drag operation.
   * Transitions from Idle to Dragging once the pointer moves past the threshold.
   */
  onDragMove(event: PointerEvent): void {
    const currentState = this._dragState$.getValue();
    if (!currentState.draggedTab) return;
    
    const x = event.clientX;
    const y = event.clientY;

    // If not yet dragging, check if threshold is met.
    if (currentState.phase !== DragPhase.Dragging) {
      const dx = x - this._dragStartX;
      const dy = y - this._dragStartY;

      if (Math.sqrt(dx * dx + dy * dy) < this.DRAG_THRESHOLD) {
        // Not yet moved enough — just update position.
        this._dragState$.next({ ...currentState, pointerX: x, pointerY: y });
        return;
      }

      // Threshold met — transition to Dragging.
      this._dragState$.next({
        ...currentState,
        phase: DragPhase.Dragging,
        pointerX: x,
        pointerY: y,
      });
      return;
    }

    // Already dragging — process normally.
    // Detect active drop zone via bounding box intersection.
    const { activeDropZone, dropCompatible } = this._detectDropZone(x, y, currentState.draggedTab);
    console.log("Dragged tab:", JSON.stringify(currentState.draggedTab));

    // Detect reorder target index if pointer is over the source tab bar.
    const reorderTargetIndex = this._detectReorderTargetIndex(x, y, currentState.draggedTab);

    // Update bounding rects for all zones.
    this._updateBoundingRects();

    // Toggle drop zone CSS classes for visual feedback.
    this._updateDropZoneClasses(activeDropZone, dropCompatible);

    this._dragState$.next({
      ...currentState,
      pointerX: x,
      pointerY: y,
      activeDropZone: activeDropZone === currentState.draggedTab?.draggable?.sourceZone ? null : activeDropZone,
      dropCompatible: activeDropZone === currentState.draggedTab?.draggable?.sourceZone ? false : dropCompatible,
    });

    // Store reorder target for use in endDrag.
    this._reorderTargetIndex = reorderTargetIndex;
  }

  /**
   * Handles pointer release. Evaluates the drop and performs the appropriate action.
   */
  endDrag(): void {
    const currentState = this._dragState$.getValue();

    // If drag never started (threshold not met), just reset.
    if (!currentState.draggedTab || currentState.phase !== DragPhase.Dragging) {
      this._resetState();
      return;
    }

    // Fallback: detect reorder target if not set by last pointermove.
    if (this._reorderTargetIndex === null) {
      this._reorderTargetIndex = this._detectReorderTargetIndex(
        currentState.pointerX,
        currentState.pointerY,
        currentState.draggedTab
      );
    }

    const { draggedTab, activeDropZone, dropCompatible } = currentState;

    // Check for same-region reorder first.
    if (this._reorderTargetIndex !== null && this._reorderTargetElement) {
      const callback = this._reorderSources.get(this._reorderTargetElement);
      if (callback) {
        // Find the source tab index in the tab bar.
        const sourceIndex = this._findTabIndexInTabBar(draggedTab.id);
        if (sourceIndex !== null && sourceIndex !== this._reorderTargetIndex) {
          callback(sourceIndex, this._reorderTargetIndex);
          this._resetState();
          return;
        }
      }
    }

    if (activeDropZone && dropCompatible) {
      // Check if dropping back to the same zone (no-op = cancel).
      if (activeDropZone === draggedTab.draggable?.sourceZone) {
        this._resetState();
        return;
      }

      // Cross-region drop: dispatch action + emit event for ShellComponent.
      this._emitCrossRegionDrop(draggedTab, activeDropZone);
    }

    this._resetState();
  }

  /**
   * Cancels the current drag operation without making any changes.
   */
  cancelDrag(): void {
    this._resetState();
  }

  /**
   * Returns whether a drag operation is currently active.
   */
  isDragging(): boolean {
    return this._dragState$.getValue().phase === DragPhase.Dragging;
  }

  // ── Internal Methods ───────────────────────────────────────────────────────

  private _setupGlobalListeners(): void {
    const pointerMoveHandler = (event: PointerEvent) => {
      this.ngZone.run(() => this.onDragMove(event));
    };
    const pointerUpHandler = () => {
      this.ngZone.run(() => this.endDrag());
    };
    const pointerCancelHandler = () => {
      this.ngZone.run(() => this.cancelDrag());
    };

    this.document.addEventListener('pointermove', pointerMoveHandler);
    this.document.addEventListener('pointerup', pointerUpHandler);
    this.document.addEventListener('pointercancel', pointerCancelHandler);

    this._globalCleanup = () => {
      this.document.removeEventListener('pointermove', pointerMoveHandler);
      this.document.removeEventListener('pointerup', pointerUpHandler);
      this.document.removeEventListener('pointercancel', pointerCancelHandler);
    };
  }

  private _updateBoundingRects(): void {
    for (const registration of this._dropZones.values()) {
      registration.boundingRect = registration.element.getBoundingClientRect();
    }
  }

  private _detectDropZone(
    x: number,
    y: number,
    draggedTab: ShellTab & WithDraggable | null
  ): { activeDropZone: DockZone | null; dropCompatible: boolean } {
    if (!draggedTab) {
      return { activeDropZone: null, dropCompatible: false };
    }

    for (const registration of this._dropZones.values()) {
      const rect = registration.boundingRect ?? registration.element.getBoundingClientRect();
      registration.boundingRect = rect;

      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const compatible = draggedTab.draggable?.allowableDropTargets.includes(registration.zone) ?? false;
        return { activeDropZone: registration.zone, dropCompatible: compatible };
      }
    }

    return { activeDropZone: null, dropCompatible: false };
  }

  private _emitCrossRegionDrop(draggedTab: ShellTab & WithDraggable, targetZone: DockZone): void {

    if (!draggedTab.draggable) return;

    // Dispatch the move action (handles source removal + target addition for PrimaryWorkspace).
    this.store.dispatch(
      moveTabToZone({
        tabId: draggedTab.id,
        sourceGroupId: draggedTab?.draggable?.sourceGroupId ?? '',
        sourceZone: draggedTab.draggable.sourceZone,
        targetZone,
        tabMetadata: draggedTab, // Pass full tab metadata for ShellComponent to register in target region
      })
    );

    // Emit event for ShellComponent to register in target region.
    this._crossRegionDrop$.next({
      tabId: draggedTab.id,
      label: draggedTab.label,
      icon: draggedTab.icon,
      componentType: draggedTab.component,
      sourceGroupId: draggedTab.draggable?.sourceGroupId ?? '',
      sourceZone: draggedTab.draggable?.sourceZone ?? '',
      targetZone,
      pinned: isTabPinnable(draggedTab) ? draggedTab.pinnable?.pinned ?? false : false,
      dirty: isTabCloseable(draggedTab) ? draggedTab.closeable?.dirty ?? false : false,
    });
  }

  private _resetState(): void {
    this._globalCleanup?.();
    this._globalCleanup = null;

    // Clear all drop zone CSS classes.
    this._clearDropZoneClasses();
    this._previousDropZone = null;

    this._dragState$.next({
      phase: DragPhase.Idle,
      draggedTab: null,
      pointerX: 0,
      pointerY: 0,
      activeDropZone: null,
      dropCompatible: false,
      pointerId: null,
    });
  }

  private _updateDropZoneClasses(
    activeDropZone: DockZone | null,
    dropCompatible: boolean
  ): void {
    // Clear classes from previous drop zone.
    if (this._previousDropZone) {
      const prevRegistration = this._dropZones.get(this._previousDropZone);
      if (prevRegistration) {
        prevRegistration.element.classList.remove('drop-zone-compatible', 'drop-zone-incompatible');
      }
    }

    // Add classes to current drop zone.
    if (activeDropZone) {
      const registration = this._dropZones.get(activeDropZone);
      if (registration) {
        const className = dropCompatible ? 'drop-zone-compatible' : 'drop-zone-incompatible';
        registration.element.classList.add(className);
      }
    }

    this._previousDropZone = activeDropZone;
  }

  private _clearDropZoneClasses(): void {
    for (const registration of this._dropZones.values()) {
      registration.element.classList.remove('drop-zone-compatible', 'drop-zone-incompatible');
    }
  }

  private _detectReorderTargetIndex(
    x: number,
    y: number,
    draggedTab: ShellTab | null
  ): number | null {
    if (!draggedTab) return null;

    for (const [element] of this._reorderSources) {
      const rect = element.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        continue;
      }

      // Pointer is over this tab bar — find the target index.
      const tabElements = element.querySelectorAll('[role="tab"]');
      for (let i = 0; i < tabElements.length; i++) {
        const tabRect = tabElements[i].getBoundingClientRect();
        const midX = tabRect.left + tabRect.width / 2;
        if (x < midX) {
          this._reorderTargetElement = element;
          return i;
        }
      }

      // Pointer is past all tabs — target is the last position.
      this._reorderTargetElement = element;
      return tabElements.length;
    }

    // Pointer is not over any registered tab bar.
    this._reorderTargetElement = null;
    return null;
  }

  private _findTabIndexInTabBar(tabId: string): number | null {
    for (const element of this._reorderSources.keys()) {
      const tabElements = element.querySelectorAll('[role="tab"]');
      for (let i = 0; i < tabElements.length; i++) {
        const testId = tabElements[i].getAttribute('data-testid');
        if (testId?.includes(tabId)) {
          return i;
        }
      }
    }

    return null;
  }
}
