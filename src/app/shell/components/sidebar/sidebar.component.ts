import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { ActivityBarComponent } from './activity-bar/activity-bar.component';
import { SidebarItem } from '../../models/sidebar-item.model';
import { EventBusService } from '../../../core/services/event-bus.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ActivityBarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly eventBus = inject(EventBusService);

  @Input() items: SidebarItem[] = [];
  @Input() activeItemId: string | null = null;
  @Input() collapsed: boolean = false;

  @Output() activeItemChange = new EventEmitter<string>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  onItemClick(item: SidebarItem): void {
    if (item.id === this.activeItemId && !this.collapsed) {
      // Clicking the already-active item while the panel is open collapses it.
      this.collapsedChange.emit(true);
      this.eventBus.emit('sidebar.collapsed.v1', { collapsed: true }, 'SidebarComponent');
    } else {
      if (this.collapsed) {
        // Clicking any item while collapsed opens the sidebar panel.
        this.collapsedChange.emit(false);
        this.eventBus.emit('sidebar.collapsed.v1', { collapsed: false }, 'SidebarComponent');
      }
      this.activeItemChange.emit(item.id);
      this.eventBus.emit('sidebar.section.activated.v1', { sectionId: item.id }, 'SidebarComponent');
    }
  }
}
