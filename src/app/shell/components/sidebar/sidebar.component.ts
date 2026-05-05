import { Component, Input, Output, EventEmitter, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityBarComponent } from './activity-bar/activity-bar.component';
import { SidebarItem } from '../../models/sidebar-item.model';
import { EventBusService } from '../../../core/services/event-bus.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ActivityBarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly eventBus = inject(EventBusService);
  private readonly zone = inject(NgZone);

  @Input() items: SidebarItem[] = [];
  @Input() activeItemId: string | null = null;
  @Input() collapsed: boolean = false;

  @Output() activeItemChange = new EventEmitter<string>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  get activeItem(): SidebarItem | null {
    if (this.items.length === 0) {
      return null;
    }

    if (this.activeItemId) {
      const selected = this.items.find(item => item.id === this.activeItemId);
      if (selected) {
        return selected;
      }
    }

    return this.items[0];
  }

  onItemClick(item: SidebarItem): void {
    performance.mark('sidebar.interaction.start');
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
    // Measure interaction latency to next paint (NFR-Perf-01: < 100 ms).
    // Runs outside the Angular zone to avoid triggering a spurious CD cycle.
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        performance.mark('sidebar.interaction.end');
        try {
          performance.measure('sidebar.interaction', 'sidebar.interaction.start', 'sidebar.interaction.end');
        } catch {
          // Marks may have been cleared externally.
        }
      });
    });
  }
}
