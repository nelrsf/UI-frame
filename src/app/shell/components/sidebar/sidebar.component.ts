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
    if (item.id === this.activeItemId && !this.collapsed) {
      // Clicking the already-active item while the panel is open collapses it.
      this.collapsedChange.emit(true);
    } else {
      if (this.collapsed) {
        // Clicking any item while collapsed opens the sidebar panel.
        this.collapsedChange.emit(false);
      }
      this.activeItemChange.emit(item.id);
    }
  }
}
