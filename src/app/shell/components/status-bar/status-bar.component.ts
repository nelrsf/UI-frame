import { Component, Input, inject } from '@angular/core';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { StatusBarItem } from '../../models/status-bar-item.model';
import { CommandRegistryService } from '../../../core/services/command-registry.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [NgFor, NgIf, NgTemplateOutlet],
  templateUrl: './status-bar.component.html',
  styleUrl: './status-bar.component.css',
})
export class StatusBarComponent {
  private readonly commandRegistry = inject(CommandRegistryService);

  @Input() leftItems: StatusBarItem[] = [];
  @Input() rightItems: StatusBarItem[] = [];

  onItemClick(item: StatusBarItem): void {
    if (!item.clickable || !item.commandId) {
      return;
    }
    this.commandRegistry.execute(item.commandId);
  }
}
