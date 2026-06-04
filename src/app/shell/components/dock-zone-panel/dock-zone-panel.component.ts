import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { NgClass, NgComponentOutlet } from '@angular/common';
import { DockZone } from '../../../core/models/dock-zone-assignment.model';
import { ShellTab } from '../../contracts/ShellTab';
import { isTabCloseable, isTabPinnable } from '../../common/ShellTabGuardTypes';
import { TabCloseGuard } from '../../models/tab-item.model';
import { DragDropService, ReorderTabsPayload } from '../../services/drag-drop.service';
import { filter } from 'rxjs';

/** Duration (ms) after which an unresolved async `beforeClose()` guard times out. */
const CLOSE_GUARD_TIMEOUT_MS = 10_000;

@Component({
  selector: 'app-dock-zone-panel',
  standalone: true,
  imports: [NgClass, NgComponentOutlet],
  templateUrl: './dock-zone-panel.component.html',
  styleUrl: './dock-zone-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DockZonePanelComponent {
  private readonly zoneRef = inject(NgZone);
  readonly dragDropService = inject(DragDropService);
  readonly el = inject(ElementRef<HTMLElement>);

  readonly DockZone = DockZone;

  @Input({ required: true }) zone: DockZone = DockZone.PrimaryTopLeftWorkspace;
  @Input() tabs: readonly ShellTab[] = [];
  @Input() activeTabId: string = '';
  @Input() visible: boolean = true;
  @Input() size: number | null = null;
  @Input() closeGuards: Record<string, TabCloseGuard> = {};
  @Input() showActions: boolean = false;

  @Output() activeTabChange = new EventEmitter<string>();
  @Output() visibilityChange = new EventEmitter<boolean>();
  @Output() sizeChange = new EventEmitter<number>();
  @Output() tabClosed = new EventEmitter<string>();
  @Output() newTabRequested = new EventEmitter<void>();
  @Output() closeGuardTimeout = new EventEmitter<string>();

  private readonly closingTabIds = new Set<string>();


  get isPrimaryWorkspace(): boolean {
    return this.zone === DockZone.PrimaryTopLeftWorkspace;
  }

  get activeTab(): ShellTab | null {
    if (this.tabs.length === 0) {
      return null;
    }

    if (this.activeTabId) {
      const selected = this.tabs.find((tab) => tab.id === this.activeTabId);
      if (selected) {
        return selected;
      }
    }

    return this.tabs[0];
  }

  get contentId(): string {
    return `${this.zone}-content`;
  }

  get ariaLabel(): string | null {
    switch (this.zone) {
      case DockZone.PrimaryTopLeftWorkspace:
        return 'Primary top left workspace';
      case DockZone.BottomCenterPanel:
        return 'Bottom center panel';
      case DockZone.BottomLeftPanel:
        return 'Bottom left panel';
      case DockZone.BottomRightPanel:
        return 'Bottom right panel';
      case DockZone.SecondaryPanel:
        return 'Secondary panel';
    }
    return null;
  }

  get emptyMessage(): string {
    return this.isPrimaryWorkspace
      ? 'Selecciona o abre un elemento para comenzar'
      : 'No panels available.';
  }

  get panelClasses(): Record<string, boolean> {
    return {
      'dock-zone-panel': true,
      'dock-zone-panel--primary': this.zone === DockZone.PrimaryTopLeftWorkspace,
      'dock-zone-panel--bottom': this.zone === DockZone.BottomCenterPanel,
      'dock-zone-panel--secondary': this.zone === DockZone.SecondaryPanel,
    };
  }

  get rendered(): boolean {
    return this.isPrimaryWorkspace || this.visible;
  }

  get heightPx(): number | null {
    return this.zone === DockZone.BottomCenterPanel ? this.size : null;
  }

  get widthPx(): number | null {
    return this.zone === DockZone.SecondaryPanel ? this.size : null;
  }

  getTabId(tab: ShellTab): string {
    return `${this.zone}-tab-btn-${tab.id}`;
  }

  getTabTestId(tab: ShellTab): string | null {
    switch (this.zone) {
      case DockZone.PrimaryTopLeftWorkspace:
        return `tab-${tab.id}`;
      case DockZone.BottomCenterPanel:
        return `panel-tab-${tab.id}`;
      case DockZone.SecondaryPanel:
        return `secondary-panel-tab-${tab.id}`;
    }
    return null;
  }

  onTabSelect(tabId: string): void {
    if (this.isPrimaryWorkspace) {
      performance.mark('tabs.switch.start');
    }

    this.activeTabChange.emit(tabId);

    if (!this.isPrimaryWorkspace) {
      return;
    }

    this.zoneRef.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        performance.mark('tabs.switch.end');
        try {
          performance.measure('tabs.switch', 'tabs.switch.start', 'tabs.switch.end');
        } catch {
          // Marks may have been cleared externally.
        }
      });
    });
  }

  async onTabClose(event: MouseEvent, tabId: string): Promise<void> {
    event.stopPropagation();

    if (this.closingTabIds.has(tabId)) {
      return;
    }

    const tab = this.tabs.find((candidate) => candidate.id === tabId);
    if (!tab || !isTabCloseable(tab)) {
      return;
    }

    if (!tab.closeable?.dirty) {
      this.tabClosed.emit(tabId);
      return;
    }

    const guard = this.closeGuards[tabId];
    if (!guard) {
      this.tabClosed.emit(tabId);
      return;
    }

    this.closingTabIds.add(tabId);
    const timeout = this.timeoutGuard(tabId);
    try {
      const allowed = await Promise.race([
        Promise.resolve(guard.beforeClose()),
        timeout.promise,
      ]);

      if (allowed) {
        this.tabClosed.emit(tabId);
      }
    } catch {
      // Guard threw; keep tab open.
    } finally {
      timeout.cancel();
      this.closingTabIds.delete(tabId);
    }
  }

  isClosingGuardPending(tabId: string): boolean {
    return this.closingTabIds.has(tabId);
  }

  canClose(tab: ShellTab): boolean {
    return this.isPrimaryWorkspace && isTabCloseable(tab) && !this.isPinned(tab);
  }

  isDirty(tab: ShellTab): boolean {
    return isTabCloseable(tab) && (tab.closeable?.dirty ?? false);
  }

  isPinned(tab: ShellTab): boolean {
    return isTabPinnable(tab) && (tab.pinnable?.pinned ?? false);
  }

  onNewTab(): void {
    this.newTabRequested.emit();
  }

  onClosePanel(): void {
    this.visibilityChange.emit(false);
  }

  onTabPointerDown(event: PointerEvent, tab: ShellTab): void {
    if (event.button !== 0) {
      return;
    }

    this.dragDropService.startDrag(tab, event);
  }

  private timeoutGuard(tabId: string): { promise: Promise<false>; cancel: () => void } {
    let timeoutId: ReturnType<typeof setTimeout>;
    const promise = new Promise<false>((resolve) => {
      timeoutId = setTimeout(() => {
        this.closeGuardTimeout.emit(tabId);
        resolve(false);
      }, CLOSE_GUARD_TIMEOUT_MS);
    });
    return { promise, cancel: () => clearTimeout(timeoutId) };
  }
}
