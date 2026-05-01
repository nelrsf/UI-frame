import { Component, AfterViewInit, HostBinding, inject, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ContentAreaComponent } from './components/content-area/content-area.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { BottomPanelComponent } from './components/bottom-panel/bottom-panel.component';
import { PlatformService } from '../core/services/platform.service';
import { EventBusService } from '../core/services/event-bus.service';
import { setPlatform, shellReady } from '../core/state/session';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [StatusBarComponent, ToolbarComponent, ContentAreaComponent, SidebarComponent, TabBarComponent, BottomPanelComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements AfterViewInit {
  private readonly platformService = inject(PlatformService);
  private readonly eventBus = inject(EventBusService);
  private readonly store = inject(Store);

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

  ngAfterViewInit(): void {
    // Persist platform and shell-readiness in the transversal session slice.
    this.store.dispatch(setPlatform({ platform: this.platformService.platform }));
    this.store.dispatch(shellReady({ timestamp: Date.now() }));

    // Notify any EventBus subscribers that the shell is ready.
    this.eventBus.emit('shell.ready.v1', {}, 'ShellComponent');
  }
}

