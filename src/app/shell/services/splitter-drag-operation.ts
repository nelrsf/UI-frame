import { BehaviorSubject, Subject } from 'rxjs';
import { DockZone } from '../../core/models/dock-zone-assignment.model';

export type DragDirection = 'horizontal' | 'vertical';

// Types for simple drag (bottom & secondary)
export type SimpleDragDraft = number | null;
export type SimpleDragEnd = number;

// Types for internal zone drag
export interface InternalZoneDragDraft {
  zone: DockZone;
  direction: DragDirection;
  draftDimension: number;
}

export interface InternalZoneDragEnd {
  zone: DockZone;
  direction: DragDirection;
  committedDimension: number;
}

/**
 * Unified drag operation class that handles both simple drag (bottom/secondary panels)
 * and internal zone drag with dynamic directions.
 */
export class DragOperation<
  TDraft extends SimpleDragDraft | InternalZoneDragDraft, 
  TEnd extends SimpleDragEnd | InternalZoneDragEnd
> {
  active = false;
  startPos = 0;
  startDimension = 0;
  
  // For internal zones
  zone?: DockZone;
  direction?: DragDirection;

  constructor(
    public readonly minDimension: number,
    public readonly maxDimension: number,
    public readonly draftSubject: BehaviorSubject<TDraft | null>,
    public readonly endSubject: Subject<TEnd>,
    public readonly fixedDirection?: DragDirection, // 'horizontal' for secondary, 'vertical' for bottom
    public readonly isInternalZoneDrag: boolean = false
  ) {}

  onPointerDown(event: PointerEvent, startDimension: number, zone?: DockZone, direction?: DragDirection): void {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
    this.active = true;
    this.startDimension = startDimension;
    
    if (this.isInternalZoneDrag) {
      this.zone = zone;
      this.direction = direction;
    } else {
      this.direction = this.fixedDirection;
    }

    const isHorizontal = this.direction === 'horizontal';
    if (isHorizontal) {
      this.startPos = event.clientX;
    } else {
      this.startPos = event.clientY;
    }
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.active || !this.direction) return;
    
    const isHorizontal = this.direction === 'horizontal';
    const pos = isHorizontal ? event.clientX : event.clientY;
    const delta = this.startPos - pos;
    const draftDimension = Math.min(this.maxDimension, Math.max(this.minDimension, Math.round(this.startDimension + delta)));
    
    let draft: TDraft | null = null as any;
    
    if (this.isInternalZoneDrag) {
      draft = {
        zone: this.zone!,
        direction: this.direction!,
        draftDimension: draftDimension
      } as TDraft;
    } else {
      draft = draftDimension as TDraft;
    }
    
    this.draftSubject.next(draft);
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.active || !this.direction) return;
    this.active = false;
    
    const isHorizontal = this.direction === 'horizontal';
    const pos = isHorizontal ? event.clientX : event.clientY;
    const delta = this.startPos - pos;
    const committedDimension = Math.min(this.maxDimension, Math.max(this.minDimension, Math.round(this.startDimension + delta)));
    
    this.draftSubject.next(null as any);
    
    let end: TEnd = null as any;
    
    if (this.isInternalZoneDrag) {
      end = {
        zone: this.zone!,
        direction: this.direction!,
        committedDimension: committedDimension
      } as TEnd;
    } else {
      end = committedDimension as TEnd;
    }
    
    this.endSubject.next(end);
  }

  onPointerCancel(_event: PointerEvent): void {
    if (!this.active) return;
    this.active = false;
    this.draftSubject.next(null as any);
  }

  complete(): void {
    this.draftSubject.complete();
    this.endSubject.complete();
  }
}