import { Component, inject, Input } from '@angular/core';
import { BreadcrumbItem, ToolbarAction } from '../../models/toolbar-action.model';
import { CommandRegistryService } from '../../../core/services/command-registry.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  private readonly commandRegistry = inject(CommandRegistryService);

  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() actions: ToolbarAction[] = [];

  onActionClick(action: ToolbarAction): void {
    if (action.disabled) {
      return;
    }
    if (action.commandId) {
      this.commandRegistry.execute(action.commandId);
    }
  }
}
