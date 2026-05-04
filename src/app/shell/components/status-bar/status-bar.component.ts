import { Component, Input } from '@angular/core';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { StatusBarItem } from '../../models/status-bar-item.model';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet],
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.css',
})
export class StatusBarComponent {
  @Input() leftItems: StatusBarItem[] = [];
  @Input() rightItems: StatusBarItem[] = [];

  onItemClick(item: StatusBarItem): void {
    if (!item.clickable) {
      return;
    }
    // commandId wiring is reserved for future command-registry integration
  }
}
