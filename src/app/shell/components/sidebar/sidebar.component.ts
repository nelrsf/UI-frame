import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivityBarComponent } from './activity-bar/activity-bar.component';
import { SidebarItem } from '../../models/sidebar-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ActivityBarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() items: SidebarItem[] = [];
  @Input() activeItemId: string | null = null;
  @Input() collapsed: boolean = false;

  @Output() activeItemChange = new EventEmitter<string>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  onItemClick(item: SidebarItem): void {
    this.activeItemChange.emit(item.id);
  }
}
