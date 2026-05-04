import { Component, Input, Output, EventEmitter, inject, NgZone } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TabItem, TabCloseGuard } from '../../models/tab-item.model';
import { EventBusService } from '../../../core/services/event-bus.service';

/** Duration (ms) after which an unresolved async `beforeClose()` guard times out. */
const CLOSE_GUARD_TIMEOUT_MS = 10_000;

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './tab-bar.component.html',
  styleUrl: './tab-bar.component.css',
})
export class TabBarComponent {
  private readonly eventBus = inject(EventBusService);
  private readonly zone = inject(NgZone);

  @Input() tabs: TabItem[] = [];
  @Input() activeTabId: string = '';
  @Input() groupId: string = '';
  /** Map of tabId → close guard. Provided by the parent host. */
  @Input() closeGuards: Record<string, TabCloseGuard> = {};

  @Output() tabSelected = new EventEmitter<string>();
  @Output() tabClosed = new EventEmitter<string>();
  /** Reserved for drag-and-drop reorder implementation in a future task. */
  @Output() tabReordered = new EventEmitter<{ fromIndex: number; toIndex: number }>();
  @Output() newTabRequested = new EventEmitter<void>();
  /** Emitted with the tabId when an async guard times out; the tab remains open. */
  @Output() closeGuardTimeout = new EventEmitter<string>();

  /** Tab IDs whose close guard is currently resolving (prevents duplicate close attempts). */
  private readonly _closingTabIds = new Set<string>();

  onTabSelect(tabId: string): void {
    performance.mark('tabs.switch.start');
    this.tabSelected.emit(tabId);
    this.eventBus.emit('tabs.active.changed.v1', { tabId }, 'TabBarComponent');
    // Measure tab-switch latency to next paint (NFR-Perf-02: < 120 ms).
    // Runs outside the Angular zone to avoid triggering a spurious CD cycle.
    this.zone.runOutsideAngular(() => {
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

    // Prevent duplicate close attempts while a guard is resolving.
    if (this._closingTabIds.has(tabId)) {
      return;
    }

    const tab = this.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Non-dirty tabs close immediately without consulting a guard.
    if (!tab.dirty) {
      this.tabClosed.emit(tabId);
      return;
    }

    // Dirty tab: consult the registered close guard, if any.
    const guard = this.closeGuards[tabId];
    if (!guard) {
      // No guard registered → allow close.
      this.tabClosed.emit(tabId);
      return;
    }

    this._closingTabIds.add(tabId);
    const timeout = this._timeoutGuard(tabId);
    try {
      const allowed = await Promise.race([
        Promise.resolve(guard.beforeClose()),
        timeout.promise,
      ]);

      if (allowed) {
        this.tabClosed.emit(tabId);
      }
      // false result (guard denied or timed out) → tab remains open.
    } catch {
      // Guard threw → keep tab open.
    } finally {
      timeout.cancel();
      this._closingTabIds.delete(tabId);
    }
  }

  /** Returns true while a close-guard resolution is in-flight for this tab. */
  isClosingGuardPending(tabId: string): boolean {
    return this._closingTabIds.has(tabId);
  }

  onNewTab(): void {
    this.newTabRequested.emit();
  }

  private _timeoutGuard(tabId: string): { promise: Promise<false>; cancel: () => void } {
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
