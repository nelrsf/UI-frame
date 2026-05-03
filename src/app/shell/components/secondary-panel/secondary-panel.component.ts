import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { PanelTab } from '../../models/panel-tab.model';

/**
 * SecondaryPanelComponent — right-side collapsible dock zone (SecondaryPanel).
 *
 * Renders the secondary-right dock zone defined by the Shell v1 MVP docking scope.
 * Visibility and width are controlled externally via @Input() bindings; resize
 * handle drag is reserved for a future task (widthChange is emitted but the drag
 * interaction is not implemented in this MVP iteration).
 */
@Component({
  selector: 'app-secondary-panel',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './secondary-panel.component.html',
  styleUrl: './secondary-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondaryPanelComponent {
  /** Whether the secondary panel is currently shown. */
  @Input() visible: boolean = false;
  /** Current panel width in pixels. */
  @Input() width: number = 300;
  /** Tabs hosted in this panel zone. */
  @Input() panels: PanelTab[] = [];
  /** Id of the currently active panel tab. */
  @Input() activePanelId: string = '';

  /** Emits the new visibility state when the user toggles or closes the panel. */
  @Output() visibilityChange = new EventEmitter<boolean>();
  /** Reserved for resize-handle drag implementation in a future task. */
  @Output() widthChange = new EventEmitter<number>();
  /** Emits the selected panel tab id. */
  @Output() activePanelChange = new EventEmitter<string>();

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
