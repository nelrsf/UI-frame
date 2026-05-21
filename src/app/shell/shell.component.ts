import { Component, OnInit, AfterViewInit, HostBinding, inject, ChangeDetectionStrategy, NgZone, DestroyRef, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, BehaviorSubject, first } from 'rxjs';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ContentAreaComponent } from './components/content-area/content-area.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { BottomPanelComponent } from './components/bottom-panel/bottom-panel.component';
import { SecondaryPanelComponent } from './components/secondary-panel/secondary-panel.component';
import { TabAddModalComponent } from './components/tab-add-modal/tab-add-modal.component';
import { DragGhostComponent } from './components/drag-ghost/drag-ghost.component';
import { PlatformService } from '../core/services/platform.service';
import { CommandRegistryService } from '../core/services/command-registry.service';
import { setPlatform, shellReady } from '../core/state/session';
import { WorkspaceSessionService } from '../core/services/workspace-session.service';
import { FALLBACK_WORKSPACE_ID } from '../core/utils/workspace-id.util';
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
  BOTTOM_PANEL_HEIGHT_MIN,
  BOTTOM_PANEL_HEIGHT_MAX,
  SECONDARY_PANEL_WIDTH_MIN,
  SECONDARY_PANEL_WIDTH_MAX,
} from '../core/state/layout/layout.reducer';
import {
  selectActiveSecondaryPanelComponentType,
  selectActiveSecondaryPanelEntryId,
  selectShellBottomPanelTabs,
  selectShellSecondaryPanelEntries,
  selectShellSidebarItems,
  selectShellToolbarActions,
  setActiveSecondaryPanelEntry,
} from '../core/state/shell-content';
import {
  selectActiveShellComponentType,
  selectActiveShellTabId,
  selectCloseGuardsForGroup,
  selectRegisteredTabsForGroup,
  selectShellTabs,
  closeTab,
  openTab,
  selectTab,
  selectTabsForGroup,
  reorderTab,
} from '../core/state/workspace';
import { setPreference } from '../core/state/preferences/preferences.actions';
import { AppTheme, THEME_PREFERENCE_KEY } from '../core/models/theme.model';
import { TabCloseGuard, TabItem } from './models/tab-item.model';
import {
  selectStatusBarLeftItems,
  selectStatusBarRightItems,
} from '../core/state/status-bar';
import { DragDropService } from './services/drag-drop.service';
import { ShellManager } from './shell-manager.service';
import { RegionInterface } from '../core/models/drag-drop.model';
import { DockZone } from '../core/models/dock-zone-assignment.model';

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
    TabAddModalComponent,
    DragGhostComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit, AfterViewInit {
  private readonly platformService = inject(PlatformService);
  private readonly commandRegistry = inject(CommandRegistryService);
  private readonly store = inject(Store);
  private readonly sessionService = inject(WorkspaceSessionService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly dragDropService = inject(DragDropService);
  private readonly shellManager = inject(ShellManager);

  /** Reference to the shell-root div for direct CSS-var updates during drag. */
  @ViewChild('shellRoot') private shellRootRef!: ElementRef<HTMLDivElement>;

  // rAF throttle state for bottom-panel resize (NFR-Perf-03)
  private _rafBottomPending = false;
  private _pendingBottomHeight: number | null = null;

  // rAF throttle state for secondary-panel resize (NFR-Perf-03)
  private _rafSecondaryPending = false;
  private _pendingSecondaryWidth: number | null = null;

  // ── Splitter drag state (local, not committed to NgRx during drag) ──────────
  _committedBottomHeight = 200;
  _committedSecondaryWidth = 300;

  private _bottomDragActive = false;
  private _bottomDragStartY = 0;
  private _bottomDragStartHeight = 0;

  private _secondaryDragActive = false;
  private _secondaryDragStartX = 0;
  private _secondaryDragStartWidth = 0;

  /** Draft height during bottom splitter drag (null = use committed NgRx value). */
  private readonly _draftBottomHeight$ = new BehaviorSubject<number | null>(null);
  /** Draft width during secondary splitter drag (null = use committed NgRx value). */
  private readonly _draftSecondaryWidth$ = new BehaviorSubject<number | null>(null);

  /** Controls visibility of the tab-add modal dialog. */
  showTabAddModal = false;

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
  /** Observable of registered shell tabs from workspace. */
  readonly shellTabs$ = this.store.select(selectShellTabs('main'));
  /** Observable of active shell tab id from workspace. */
  readonly activeShellTabId$ = this.store.select(selectActiveShellTabId('main'));
  /** Observable of active shell tab component type from workspace for dynamic rendering. */
  readonly activeShellComponentType$ = this.store.select(selectActiveShellComponentType('main'));
  /** Observable of close guards map for TabBarComponent. */
  readonly closeGuards$ = this.store.select(selectCloseGuardsForGroup('main'));
  /** Observable of registered bottom panel tabs. */
  readonly bottomPanelTabs$ = this.store.select(selectShellBottomPanelTabs);
  /** Observable of secondary panel entries. */
  readonly secondaryPanelEntries$ = this.store.select(selectShellSecondaryPanelEntries);
  /** Observable of active secondary panel entry id. */
  readonly activeSecondaryPanelEntryId$ = this.store.select(selectActiveSecondaryPanelEntryId);
  /** Observable of active secondary panel component type for dynamic rendering. */
  readonly activeSecondaryPanelComponentType$ = this.store.select(selectActiveSecondaryPanelComponentType);
  /** Observable of open tab IDs in the main workspace group (for modal picker). */
  readonly openTabIds$ = this.store.select(selectTabsForGroup('main')).pipe(
    map((tabs) => new Set(tabs.map((t) => t.id)))
  );
  /** Observable of status bar items for the left section. */
  readonly statusBarLeftItems$ = this.store.select(selectStatusBarLeftItems);
  /** Observable of status bar items for the right section. */
  readonly statusBarRightItems$ = this.store.select(selectStatusBarRightItems);
  /** Observable of registered tabs not currently open (for the tab-add modal). */
  readonly availableTabsForModal$ = combineLatest([
    this.store.select(selectRegisteredTabsForGroup('main')),
    this.openTabIds$,
  ]).pipe(
    map(([registered, openIds]) => registered.filter((tab) => !openIds.has(tab.id)))
  );
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
   * CSS var for --shell-bottom-panel-height.
   * Reflects draft height during drag; falls back to committed NgRx value.
   */
  readonly shellBottomPanelHeightPx$ = combineLatest([
    this.bottomPanelVisible$,
    this.bottomPanelHeight$,
    this._draftBottomHeight$,
  ]).pipe(
    map(([visible, committed, draft]) =>
      visible ? `${draft ?? committed}px` : '0px'
    )
  );

  /**
   * CSS var for --shell-secondary-panel-width.
   * Reflects draft width during drag; falls back to committed NgRx value.
   */
  readonly shellSecondaryPanelWidthPx$ = combineLatest([
    this.secondaryPanelVisible$,
    this.secondaryPanelWidth$,
    this._draftSecondaryWidth$,
  ]).pipe(
    map(([visible, committed, draft]) =>
      visible ? `${draft ?? committed}px` : '0px'
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

    // Track committed dimension values so drag can start from the right baseline.
    this.bottomPanelHeight$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((h) => { this._committedBottomHeight = h; });
    this.secondaryPanelWidth$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((w) => { this._committedSecondaryWidth = w; });

    // Register shell panel toggle commands in the central command registry.
    // These commands are invoked by the native menu via the IPC → preload bridge.
    this.commandRegistry.register({
      id: 'shell.panel.toggleBottom',
      label: 'Panel inferior',
      category: 'Vista',
      execute: () => {
        this.store.dispatch(toggleBottomPanel());
      },
    });

    this.commandRegistry.register({
      id: 'shell.panel.toggleSecondary',
      label: 'Panel secundario',
      category: 'Vista',
      execute: () => {
        this.store.dispatch(toggleSecondaryPanel());
      },
    });

    // Subscribe to native menu IPC events from the preload bridge.
    // Each event executes the corresponding command through the central registry.
    const electronAPI = (window as unknown as { electronAPI?: { menu?: {
      onToggleBottomPanel?: (cb: () => void) => void;
      onToggleSecondaryPanel?: (cb: () => void) => void;
      onThemeChanged?: (cb: (theme: AppTheme) => void) => void;
      updatePanelState?: (bottomPanelVisible: boolean, secondaryPanelVisible: boolean) => Promise<void>;
    }}}).electronAPI;

    if (electronAPI?.menu) {
      electronAPI.menu.onToggleBottomPanel?.(() => {
        this.zone.run(() => this.commandRegistry.execute('shell.panel.toggleBottom'));
      });

      electronAPI.menu.onToggleSecondaryPanel?.(() => {
        this.zone.run(() => this.commandRegistry.execute('shell.panel.toggleSecondary'));
      });

      electronAPI.menu.onThemeChanged?.((theme: AppTheme) => {
        this.zone.run(() => this.store.dispatch(setPreference({ key: THEME_PREFERENCE_KEY, value: theme })));
      });

      // Sync panel state to menu when state changes in store
      combineLatest([
        this.store.select(selectBottomPanelVisible),
        this.store.select(selectSecondaryPanelVisible),
      ])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(([bottomVisible, secondaryVisible]) => {
          electronAPI.menu?.updatePanelState?.(bottomVisible, secondaryVisible);
        });
    }

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

    // Register drop zones for drag-and-drop after view init.
    // We defer to ngAfterViewInit to ensure DOM elements are available.
  }

  private _registerDropZones(): void {
    // Use setTimeout to ensure the view is fully rendered.
    setTimeout(() => {
      const bottomPanelEl = this.elementRef.nativeElement.querySelector('.shell-bottom-panel');
      const secondaryPanelEl = this.elementRef.nativeElement.querySelector('.shell-secondary-panel');

      if (bottomPanelEl) {
        this.dragDropService.registerDropZone(
          DockZone.BottomPanel,
          bottomPanelEl as HTMLElement,
          RegionInterface.BottomPanelEntry
        );
      }

      if (secondaryPanelEl) {
        this.dragDropService.registerDropZone(
          DockZone.SecondaryPanel,
          secondaryPanelEl as HTMLElement,
          RegionInterface.SecondaryPanelEntry
        );
      }
    }, 0);
  }

  private _setupEscapeKeyHandler(): void {
    this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.dragDropService.isDragging()) {
        this.dragDropService.cancelDrag();
      }
    });
  }

  ngAfterViewInit(): void {
    // Persist platform and shell-readiness in the transversal session slice.
    this.store.dispatch(setPlatform({ platform: this.platformService.platform }));
    this.store.dispatch(shellReady({ timestamp: Date.now() }));

    // Register drop zones and setup escape key handler for drag-and-drop.
    this._registerDropZones();
    this._setupEscapeKeyHandler();

    // Handle cross-region drop events — register tab in target region.
    this.dragDropService.crossRegionDrop$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((drop) => {
        if (drop.targetZone === DockZone.BottomPanel) {
          this.shellManager.addBottomPanelEntry({
            id: drop.tabId,
            label: drop.label,
            icon: drop.icon,
            component: drop.componentType,
          });
        } else if (drop.targetZone === DockZone.SecondaryPanel) {
          this.shellManager.addSecondaryPanelEntry({
            id: drop.tabId,
            label: drop.label,
            icon: drop.icon,
            component: drop.componentType,
          });
        }
      });
  }

  // ---------------------------------------------------------------------------
  // Output handlers — propagate child component events to the layout store
  // ---------------------------------------------------------------------------

  onSidebarCollapsedChange(_collapsed: boolean): void {
    performance.mark('shell.sidebar.toggle.start');
    this.store.dispatch(toggleSidebar());
    this._markEnd('shell.sidebar.toggle');
  }

  onSidebarActiveItemChange(itemId: string): void {
    this.store.dispatch(setActiveSidebarItem({ itemId }));
  }

  onShellTabSelected(tabId: string): void {
    this.store.dispatch(selectTab({ tabId, groupId: 'main' }));
  }

  onShellTabReordered(event: { fromIndex: number; toIndex: number }): void {
    this.store.dispatch(reorderTab({ groupId: 'main', fromIndex: event.fromIndex, toIndex: event.toIndex }));
  }

  onShellTabClosed(tabId: string): void {
    this.store.dispatch(closeTab({ tabId, groupId: 'main' }));
  }

  onCloseGuardTimeout(tabId: string): void {
    console.warn(`[Shell] Close guard timed out for tab '${tabId}'. Tab remains open.`);
  }

  onNewTabRequested(): void {
    this.showTabAddModal = true;
  }

  onTabAddModalSelected(tabId: string): void {
    this.store.select(selectRegisteredTabsForGroup('main')).pipe(first()).subscribe((tabs) => {
      const found = tabs.find((t) => t.id === tabId);
      if (found) {
        this.store.dispatch(openTab({ tab: found }));
      }
    });
    this.showTabAddModal = false;
  }

  onTabAddModalDismissed(): void {
    this.showTabAddModal = false;
  }

  onBottomPanelVisibilityChange(_visible: boolean): void {
    performance.mark('shell.bottom-panel.toggle.start');
    this.store.dispatch(toggleBottomPanel());
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

  // ── Bottom splitter pointer events ────────────────────────────────────────

  onBottomSplitterPointerDown(event: PointerEvent): void {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
    this._bottomDragActive = true;
    this._bottomDragStartY = event.clientY;
    this._bottomDragStartHeight = this._committedBottomHeight;
  }

  onBottomSplitterPointerMove(event: PointerEvent): void {
    if (!this._bottomDragActive) return;
    const delta = this._bottomDragStartY - event.clientY;
    const draft = Math.min(BOTTOM_PANEL_HEIGHT_MAX, Math.max(BOTTOM_PANEL_HEIGHT_MIN, Math.round(this._bottomDragStartHeight + delta)));
    this._draftBottomHeight$.next(draft);
  }

  onBottomSplitterPointerUp(event: PointerEvent): void {
    if (!this._bottomDragActive) return;
    this._bottomDragActive = false;
    const delta = this._bottomDragStartY - event.clientY;
    const committed = Math.min(BOTTOM_PANEL_HEIGHT_MAX, Math.max(BOTTOM_PANEL_HEIGHT_MIN, Math.round(this._bottomDragStartHeight + delta)));
    this._draftBottomHeight$.next(null);
    this.store.dispatch(setBottomPanelHeight({ height: committed }));
  }

  onBottomSplitterPointerCancel(_event: PointerEvent): void {
    if (!this._bottomDragActive) return;
    this._bottomDragActive = false;
    this._draftBottomHeight$.next(null);
  }

  // ── Secondary splitter pointer events ─────────────────────────────────────

  onSecondarySplitterPointerDown(event: PointerEvent): void {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    event.preventDefault?.();
    this._secondaryDragActive = true;
    this._secondaryDragStartX = event.clientX;
    this._secondaryDragStartWidth = this._committedSecondaryWidth;
  }

  onSecondarySplitterPointerMove(event: PointerEvent): void {
    if (!this._secondaryDragActive) return;
    const delta = this._secondaryDragStartX - event.clientX;
    const draft = Math.min(SECONDARY_PANEL_WIDTH_MAX, Math.max(SECONDARY_PANEL_WIDTH_MIN, Math.round(this._secondaryDragStartWidth + delta)));
    this._draftSecondaryWidth$.next(draft);
  }

  onSecondarySplitterPointerUp(event: PointerEvent): void {
    if (!this._secondaryDragActive) return;
    this._secondaryDragActive = false;
    const delta = this._secondaryDragStartX - event.clientX;
    const committed = Math.min(SECONDARY_PANEL_WIDTH_MAX, Math.max(SECONDARY_PANEL_WIDTH_MIN, Math.round(this._secondaryDragStartWidth + delta)));
    this._draftSecondaryWidth$.next(null);
    this.store.dispatch(setSecondaryPanelWidth({ width: committed }));
  }

  onSecondarySplitterPointerCancel(_event: PointerEvent): void {
    if (!this._secondaryDragActive) return;
    this._secondaryDragActive = false;
    this._draftSecondaryWidth$.next(null);
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
