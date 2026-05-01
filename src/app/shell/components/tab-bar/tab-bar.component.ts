import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TabItem } from '../../models/tab-item.model';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.css',
})
export class TabBarComponent {
  @Input() tabs: TabItem[] = [];
  @Input() activeTabId: string = '';
  @Input() groupId: string = '';

  @Output() tabSelected = new EventEmitter<string>();
  @Output() tabClosed = new EventEmitter<string>();
  /** Reserved for drag-and-drop reorder implementation in a future task. */
  @Output() tabReordered = new EventEmitter<{ fromIndex: number; toIndex: number }>();
  @Output() newTabRequested = new EventEmitter<void>();

  onTabSelect(tabId: string): void {
    this.tabSelected.emit(tabId);
  }

  onTabClose(event: MouseEvent, tabId: string): void {
    event.stopPropagation();
    this.tabClosed.emit(tabId);
  }

  onNewTab(): void {
    this.newTabRequested.emit();
  }
}
