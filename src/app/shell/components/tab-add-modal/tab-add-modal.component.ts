import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { ShellTab } from '../../contracts/ShellTab';

@Component({
  selector: 'app-tab-add-modal',
  standalone: true,
  imports: [],
  templateUrl: './tab-add-modal.component.html',
  styleUrl: './tab-add-modal.component.css',
})
export class TabAddModalComponent {
  @Input() availableTabs: ShellTab[] = [];

  @Output() tabSelected = new EventEmitter<string>();
  @Output() dismissed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.dismissed.emit();
  }

  onSelectTab(tabId: string): void {
    this.tabSelected.emit(tabId);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('tab-add-modal__backdrop')) {
      this.dismissed.emit();
    }
  }
}
