import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { DragDropService } from '../../services/drag-drop.service';
import { DragState, DragPhase, DraggableTab } from '../../../core/models/drag-drop.model';

@Component({
  selector: 'app-drag-ghost',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './drag-ghost.component.html',
  styleUrl: './drag-ghost.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DragGhostComponent implements OnDestroy {
  private _subscription: Subscription;

  dragState: DragState | null = null;

  constructor(private readonly dragDropService: DragDropService) {
    this._subscription = this.dragDropService.activeDragState$.subscribe((state) => {
      this.dragState = state;
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  get isVisible(): boolean {
    return this.dragState !== null && this.dragState.phase === DragPhase.Dragging;
  }

  get draggedTab(): DraggableTab | null {
    return this.dragState?.draggedTab ?? null;
  }

  get ghostStyle(): Record<string, string> {
    if (!this.dragState) return {};
    return {
      left: `${this.dragState.pointerX + 12}px`,
      top: `${this.dragState.pointerY - 8}px`,
    };
  }

  get compatibilityClass(): string {
    if (!this.dragState) return '';
    if (this.dragState.activeDropZone === null) return '';
    return this.dragState.dropCompatible ? 'drag-ghost--compatible' : 'drag-ghost--incompatible';
  }
}
