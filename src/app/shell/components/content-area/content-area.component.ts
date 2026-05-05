import { Component, Input, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { TabItem } from '../../models/tab-item.model';
import { DockZone } from '../../../core/models/dock-zone-assignment.model';

@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './content-area.component.html',
  styleUrl: './content-area.component.css',
})
export class ContentAreaComponent {
  @Input() activeTab: TabItem | null = null;
  /** The dock zone this content area is rendering for. Defaults to PrimaryWorkspace. */
  @Input() zone: DockZone = DockZone.PrimaryWorkspace;
  /** Dynamic component type to render for the active tab. */
  @Input() componentType: Type<unknown> | null = null;
}
