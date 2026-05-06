import { Component, OnInit, AfterViewInit, HostBinding, inject, ChangeDetectionStrategy, NgZone, DestroyRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ContentAreaComponent } from './components/content-area/content-area.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { BottomPanelComponent } from './components/bottom-panel/bottom-panel.component';
import { SecondaryPanelComponent } from './components/secondary-panel/secondary-panel.component';
import { PlatformService } from '../core/services/platform.service';
import { EventBusService } from '../core/services/event-bus.service';
import { setPlatform, shellReady } from '../core/state/session';
import { WorkspaceSessionService } from '../core/services/workspace-session.service';
import { FALLBACK_WORKSPACE_ID } from '../core/utils/workspace-id.util';
import { DockZone } from '../core/models/dock-zone-assignment.model';
import {
  restoreLayout,
  toggleSidebar,
  setBottomPanelHeight,
  toggleBottomPanel,
  setActiveSidebarItem,
  toggleSecondaryPanel,
  setSecondaryPanelWidth,
} from '../core/state/layout/layout.actions';
import {
  selectSidebarVisible,
  selectSidebarWidth,
  selectBottomPanelVisible,
  selectBottomPanelHeight,
  selectActiveSidebarItem,
  selectSecondaryPanelVisible,
  selectSecondaryPanelWidth,
} from '../core/state/layout/layout.selectors';
import {
  selectActiveShellComponentType,
  selectActiveShellTabId,
  selectActiveSecondaryPanelComponentType,
  selectActiveSecondaryPanelEntryId,
  selectShellBottomPanelTabs,
  selectShellSecondaryPanelEntries,
  selectShellSidebarItems,
  selectShellTabs,
  selectShellToolbarActions,
  setActiveSecondaryPanelEntry,
  setActiveShellTab,
} from '../core/state/shell-content';
import { TabItem } from './models/tab-item.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    AsyncPipe,
    StatusBarComponent,
    ToolbarComponent,
    ContentAreaComponent,
    SidebarComponent,
    TabBarComponent,
    BottomPanelComponent,
    SecondaryPanelComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit, AfterViewInit {
  private readonly platformService = inject(PlatformService);
  private readonly eventBus = inject(EventBusService);
  private readonly store = inject(Store);
  private readonly sessionService = inject(WorkspaceSessionService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  // rAF throttle state for bottom-panel resize (NFR-Perf-03)
  private _rafBottomPending = false;
  private _pendingBottomHeight: number | null = null;

  // rAF throttle state for secondary-panel resize (NFR-Perf-03)
  private _rafSecondaryPending = false;
  private _pendingSecondaryWidth: number | null = null;

  activeBottomPanelId = '';

  /** Observable of the sidebar visibility flag from the layout state. */
  readonly sidebarVisible$: Observable<boolean> = this.store.select(selectSidebarVisible);
  /** Observable of the sidebar width in pixels from the layout state. */
  readonly sidebarWidth$: Observable<number> = this.store.select(selectSidebarWidth);
  /** Observable of the bottom-panel visibility flag from the layout state. */
  readonly bottomPanelVisible$: Observable<boolean> = this.store.select(selectBottomPanelVisible);
  /** Observable of the bottom-panel height in pixels from the layout state. */
  readonly bottomPanelHeight$: Observable<number> = this.store.select(selectBottomPanelHeight);
  /** Observable of the active sidebar item ID from the layout state. */
  readonly activeSidebarItem$: Observable<string | null> = this.store.select(selectActiveSidebarItem);
  /** Observable of the secondary panel visibility flag from the layout state. */
  readonly secondaryPanelVisible$: Observable<boolean> = this.store.select(selectSecondaryPanelVisible);
  /** Observable of the secondary panel width in pixels from the layout state. */
  readonly secondaryPanelWidth$: Observable<number> = this.store.select(selectSecondaryPanelWidth);
  /** Observable of registered sidebar entries from shellContent. */
  readonly sidebarItems$ = this.store.select(selectShellSidebarItems);
  /** Observable of registered toolbar actions from shellContent. */
  readonly toolbarActions$ = this.store.select(selectShellToolbarActions);
  /** Observable of registered shell tabs from shellContent. */
  readonly shellTabs$ = this.store.select(selectShellTabs);
  /** Observable of active shell tab id. */
  readonly activeShellTabId$ = this.store.select(selectActiveShellTabId);
  /** Observable of active shell tab component type for dynamic rendering. */
  readonly activeShellComponentType$ = this.store.select(selectActiveShellComponentType);
  /** Observable of registered bottom panel tabs. */
  readonly bottomPanelTabs$ = this.store.select(selectShellBottomPanelTabs);
  /** Observable of secondary panel entries. */
  readonly secondaryPanelEntries$ = this.store.select(selectShellSecondaryPanelEntries);
  /** Observable of active secondary panel entry id. */
  readonly activeSecondaryPanelEntryId$ = this.store.select(selectActiveSecondaryPanelEntryId);
  /** Observable of active secondary panel component type for dynamic rendering. */
  readonly activeSecondaryPanelComponentType$ = this.store.select(selectActiveSecondaryPanelComponentType);
  /** Derived observable for the active tab metadata consumed by ContentArea. */
  readonly activeShellTab$: Observable<TabItem | null> = combineLatest([
    this.shellTabs$,
    this.activeShellTabId$,
  ]).pipe(
    map(([tabs, activeId]) => tabs.find((tab) => tab.id === activeId) ?? null)
  );

  /**
   * Derives the CSS value for --shell-sidebar-width used by the grid column.
   * When the sidebar panel is collapsed the column shrinks to the activity-bar
   * width so the workspace region expands to fill the freed space.
   * Presentation-only derivation — must not live in the layout store slice.
   */
  readonly shellSidebarColumnWidth$ = combineLatest([
    this.sidebarVisible$,
    this.sidebarWidth$,
  ]).pipe(
    map(([visible, width]) =>
      visible ? `${width ?? 240}px` : 'var(--shell-activity-bar-width)'
    )
  );

  /**
   * Adds a platform-specific CSS class to the host element so that
   * platform-aware styles (e.g. title-bar spacing on macOS) can be applied
   * without querying the DOM directly.
   *
   * Example values: `platform-win32`, `platform-darwin`, `platform-linux`.
   */
  @HostBinding('class')
  get hostClass(): string {
    return this.platformService.platformClass;
  }

  ngOnInit(): void {
    this.bottomPanelTabs$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((panels) => this.syncActiveBottomPanel(panels));

    // Attempt to restore the persisted workspace session for the default workspace.
    // Valid dimension and visibility values are dispatched as a layout restoration;
    // absent or corrupt sessions fall back to the reducer's safe defaults.
    // The reducer clamps all dimension values to their configured min/max bounds.
    const session = this.sessionService.restore(FALLBACK_WORKSPACE_ID);
    if (session) {
      const bottomZone = session.zoneAssignments.find(
        (z) => z.zone === DockZone.BottomPanel
      );
      const secondaryZone = session.zoneAssignments.find(
        (z) => z.zone === DockZone.SecondaryPanel
      );

      this.store.dispatch(
        restoreLayout({
          // The WorkspaceSession v1 model does not persist sidebar collapsed/expanded
          // state — the sidebar is always shown on restore so the workspace is
          // immediately usable. Future sessions may add a sidebarVisible field.
          sidebarVisible: true,
          sidebarWidth: session.dimensions.sidebarWidth,
          bottomPanelVisible: bottomZone?.visible ?? false,
          bottomPanelHeight: session.dimensions.bottomPanelHeight,
          secondaryPanelVisible: secondaryZone?.visible ?? false,
          secondaryPanelWidth: session.dimensions.secondaryPanelWidth,
        })
      );
    }
  }

  ngAfterViewInit(): void {
    // Persist platform and shell-readiness in the transversal session slice.
    this.store.dispatch(setPlatform({ platform: this.platformService.platform }));
    this.store.dispatch(shellReady({ timestamp: Date.now() }));

    // Notify any EventBus subscribers that the shell is ready.
    this.eventBus.emit('shell.ready.v1', {}, 'ShellComponent');
  }

  // ---------------------------------------------------------------------------
  // Output handlers — propagate child component events to the layout store
  // ---------------------------------------------------------------------------

  onSidebarCollapsedChange(_collapsed: boolean): void {
    performance.mark('shell.sidebar.toggle.start');
    this.store.dispatch(toggleSidebar());
    this.eventBus.emit('shell.layout.changed.v1', { layout: 'sidebar' }, 'ShellComponent');
    this._markEnd('shell.sidebar.toggle');
  }

  onSidebarActiveItemChange(itemId: string): void {
    this.store.dispatch(setActiveSidebarItem({ itemId }));
  }

  onShellTabSelected(tabId: string): void {
    this.store.dispatch(setActiveShellTab({ id: tabId }));
  }

  onBottomPanelVisibilityChange(_visible: boolean): void {
    performance.mark('shell.bottom-panel.toggle.start');
    this.store.dispatch(toggleBottomPanel());
    this.eventBus.emit('shell.layout.changed.v1', { layout: 'bottom-panel' }, 'ShellComponent');
    this._markEnd('shell.bottom-panel.toggle');
  }

  onBottomPanelHeightChange(height: number): void {
    // Coalesce rapid resize events to one dispatch per event-loop turn (NFR-Perf-03: >30 FPS).
    // setTimeout(0) is used instead of requestAnimationFrame to allow synchronous flushing
    // in unit tests (fakeAsync + tick(0)).  Both strategies prevent multiple store dispatches
    // from a burst of drag events; the actual frame rate is governed by CSS paint scheduling.
    this._pendingBottomHeight = height;
    if (!this._rafBottomPending) {
      this._rafBottomPending = true;
      setTimeout(() => {
        this._rafBottomPending = false;
        const h = this._pendingBottomHeight!;
        this._pendingBottomHeight = null;
        performance.mark('shell.bottom-panel.resize.start');
        this.store.dispatch(setBottomPanelHeight({ height: h }));
        this.eventBus.emit('bottomPanel.resized.v1', { height: h }, 'ShellComponent');
        this._markEnd('shell.bottom-panel.resize');
      }, 0);
    }
  }

  onBottomPanelActivePanelChange(panelId: string): void {
    this.activeBottomPanelId = panelId;
  }

  private syncActiveBottomPanel(panels: Array<{ id: string }>): void {
    if (panels.length === 0) {
      this.activeBottomPanelId = '';
      return;
    }

    const hasActivePanel = panels.some((panel) => panel.id === this.activeBottomPanelId);
    if (!hasActivePanel) {
      this.activeBottomPanelId = panels[0].id;
    }
  }

  onSecondaryPanelVisibilityChange(_visible: boolean): void {
    performance.mark('shell.secondary-panel.toggle.start');
    this.store.dispatch(toggleSecondaryPanel());
    this._markEnd('shell.secondary-panel.toggle');
  }

  onSecondaryPanelActiveEntryChange(entryId: string): void {
    this.store.dispatch(setActiveSecondaryPanelEntry({ id: entryId }));
  }

  onSecondaryPanelWidthChange(width: number): void {
    // Coalesce rapid resize events to one dispatch per event-loop turn (NFR-Perf-03: >30 FPS).
    // See onBottomPanelHeightChange for the rationale behind setTimeout(0) vs requestAnimationFrame.
    this._pendingSecondaryWidth = width;
    if (!this._rafSecondaryPending) {
      this._rafSecondaryPending = true;
      setTimeout(() => {
        this._rafSecondaryPending = false;
        const w = this._pendingSecondaryWidth!;
        this._pendingSecondaryWidth = null;
        performance.mark('shell.secondary-panel.resize.start');
        this.store.dispatch(setSecondaryPanelWidth({ width: w }));
        this._markEnd('shell.secondary-panel.resize');
      }, 0);
    }
  }

  /**
   * Schedules a performance end-mark and measure for the named interaction
   * after the next animation frame.  Runs outside the Angular zone so the
   * rAF callback does not trigger an unnecessary change-detection cycle.
   */
  private _markEnd(name: string): void {
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        performance.mark(`${name}.end`);
        try {
          performance.measure(name, `${name}.start`, `${name}.end`);
        } catch {
          // Marks may have been cleared by the browser (e.g. performance.clearMarks).
        }
      });
    });
  }
}
