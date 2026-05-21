import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { DragDropService } from '../../services/drag-drop.service';
import { DragState } from '../../../core/models/drag-drop.model';

@Component({
  selector: 'app-drag-ghost',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './drag-ghost.component.html',
  styleUrl: './drag-ghost.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DragGhostComponent {
  readonly dragState$: Observable<DragState | null> = this.dragDropService.activeDragState$;

  constructor(private readonly dragDropService: DragDropService) {}
}
