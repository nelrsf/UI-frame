import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { TabItem } from '../../models/tab-item.model';

@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [NgIf],
  templateUrl: './content-area.component.html',
  styleUrl: './content-area.component.css',
})
export class ContentAreaComponent {
  @Input() activeTab: TabItem | null = null;
}
