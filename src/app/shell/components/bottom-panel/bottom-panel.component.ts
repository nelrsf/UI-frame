import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelTab } from '../../models/panel-tab.model';

@Component({
  selector: 'app-bottom-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-panel.component.html',
  styleUrl: './bottom-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomPanelComponent {

  @Input() visible: boolean = false;
  @Input() height: number = 220;
  @Input() panels: PanelTab[] = [];
  @Input() activePanelId: string = '';

  @Output() visibilityChange = new EventEmitter<boolean>();
  /** Reserved for resize-handle drag implementation in a future task. */
  @Output() heightChange = new EventEmitter<number>();
  @Output() activePanelChange = new EventEmitter<string>();

  get activePanel(): PanelTab | null {
    if (this.panels.length === 0) {
      return null;
    }

    if (this.activePanelId) {
      const selected = this.panels.find(panel => panel.id === this.activePanelId);
      if (selected) {
        return selected;
      }
    }

    return this.panels[0];
  }

  onPanelSelect(panelId: string): void {
    this.activePanelChange.emit(panelId);
  }

  onToggle(): void {
    this.visibilityChange.emit(!this.visible);
  }

  onClose(): void {
    this.visibilityChange.emit(false);
  }
}
