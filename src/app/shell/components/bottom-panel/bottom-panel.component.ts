import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { DragDropService } from '../../services/drag-drop.service';
import { DraggableTab, RegionInterface } from '../../../core/models/drag-drop.model';
import { DockZone } from '../../../core/models/dock-zone-assignment.model';
import { PanelTab } from '../../models/panel-tab.model';
import { AppState } from '../../../core/state/app.state';
import * as WorkspaceActions from '../../../core/state/workspace';

@Component({
  selector: 'app-bottom-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-panel.component.html',
  styleUrl: './bottom-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomPanelComponent implements AfterViewInit {

  @Input() workspaceId: string = 'ws-default';
  @Input() visible: boolean = false;
  @Input() height: number = 220;
  @Input() panels: readonly PanelTab[] = [];
  @Input() activePanelId: string = '';

  @Output() visibilityChange = new EventEmitter<boolean>();
  /** Reserved for resize-handle drag implementation in a future task. */
  @Output() heightChange = new EventEmitter<number>();
  @Output() activePanelChange = new EventEmitter<string>();

  @ViewChild('tabList', { static: false }) tabListRef!: ElementRef<HTMLElement>;

  constructor(
    public readonly dragDropService: DragDropService,
    private readonly store: Store<AppState>
  ) {}

  ngAfterViewInit(): void {
    this.dragDropService.registerReorderSource(
      this.tabListRef.nativeElement,
      (fromIndex: number, toIndex: number) => {
        this.store.dispatch(WorkspaceActions.reorderBottomPanelTabs({
          workspaceId: this.workspaceId,
          fromIndex,
          toIndex
        }));
      }
    );
  }

  get activePanel(): PanelTab | null {
    if (this.panels.length === 0) {
      return null;
    }

    if (this.activePanelId) {
      const selected = this.panels.find(panel => panel.id === this.activePanelId);
      if (selected) {
        return selected;
      }
    }

    return this.panels[0];
  }

  onPanelSelect(panelId: string): void {
    this.activePanelChange.emit(panelId);
  }

  onToggle(): void {
    this.visibilityChange.emit(!this.visible);
  }

  onClose(): void {
    this.visibilityChange.emit(false);
  }

  onTabPointerDown(event: PointerEvent, panel: PanelTab): void {
    if (event.button !== 0) return;

    const componentInterfaces = this.dragDropService.getComponentInterfaces(panel.component);

    const draggableTab: DraggableTab = {
      id: panel.id,
      label: panel.label,
      icon: panel.icon,
      componentType: panel.component,
      implementedInterfaces: componentInterfaces,
      sourceZone: DockZone.BottomPanel,
      sourceGroupId: '',
      pinned: false,
      dirty: false,
      closable: panel.closable,
    };

    this.dragDropService.startDrag(draggableTab, event);
  }
}
