import { Component, OnInit, AfterViewInit, HostBinding, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
    this.store.dispatch(toggleSidebar());
  }

  onSidebarActiveItemChange(itemId: string): void {
    this.store.dispatch(setActiveSidebarItem({ itemId }));
  }

  onBottomPanelVisibilityChange(_visible: boolean): void {
    this.store.dispatch(toggleBottomPanel());
  }

  onBottomPanelHeightChange(height: number): void {
    this.store.dispatch(setBottomPanelHeight({ height }));
  }

  onSecondaryPanelVisibilityChange(_visible: boolean): void {
    this.store.dispatch(toggleSecondaryPanel());
  }

  onSecondaryPanelWidthChange(width: number): void {
    this.store.dispatch(setSecondaryPanelWidth({ width }));
  }
}

