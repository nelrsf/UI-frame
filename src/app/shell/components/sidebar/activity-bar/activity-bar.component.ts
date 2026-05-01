import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { SidebarItem } from '../../../models/sidebar-item.model';

@Component({
  selector: 'app-activity-bar',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './activity-bar.component.html',
  styleUrl: './activity-bar.component.css',
})
export class ActivityBarComponent {
  @Input() items: SidebarItem[] = [];
  @Input() activeItemId: string | null = null;

  @Output() itemClick = new EventEmitter<SidebarItem>();

  get topItems(): SidebarItem[] {
    return this.items.filter(item => item.position === 'top');
  }

  get bottomItems(): SidebarItem[] {
    return this.items.filter(item => item.position === 'bottom');
  }

  onItemClick(item: SidebarItem): void {
    this.itemClick.emit(item);
  }

  isActive(item: SidebarItem): boolean {
    return this.activeItemId === item.id;
  }
}
