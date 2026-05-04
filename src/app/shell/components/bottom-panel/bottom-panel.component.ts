import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { PanelTab } from '../../models/panel-tab.model';
import { EventBusService } from '../../../core/services/event-bus.service';

@Component({
  selector: 'app-bottom-panel',
  standalone: true,
  imports: [],
  templateUrl: './bottom-panel.component.html',
  styleUrl: './bottom-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomPanelComponent {
  private readonly eventBus = inject(EventBusService);

  @Input() visible: boolean = false;
  @Input() height: number = 220;
  @Input() panels: PanelTab[] = [];
  @Input() activePanelId: string = '';

  @Output() visibilityChange = new EventEmitter<boolean>();
  /** Reserved for resize-handle drag implementation in a future task. */
  @Output() heightChange = new EventEmitter<number>();
  @Output() activePanelChange = new EventEmitter<string>();

  onPanelSelect(panelId: string): void {
    this.activePanelChange.emit(panelId);
  }

  onToggle(): void {
    this.visibilityChange.emit(!this.visible);
    this.eventBus.emit('bottomPanel.toggled.v1', { visible: !this.visible }, 'BottomPanelComponent');
  }

  onClose(): void {
    this.visibilityChange.emit(false);
    this.eventBus.emit('bottomPanel.toggled.v1', { visible: false }, 'BottomPanelComponent');
  }
}
