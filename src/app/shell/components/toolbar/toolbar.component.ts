import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BreadcrumbItem, ToolbarAction } from '../../models/toolbar-action.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() actions: ToolbarAction[] = [];

  onActionClick(action: ToolbarAction): void {
    if (action.disabled) {
      return;
    }
    // commandId wiring is reserved for future command-registry integration
  }
}
