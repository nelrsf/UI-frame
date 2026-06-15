import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommandRegistryService } from '../core/services/command-registry.service';
import { AppState } from '../core/state/app.state';
import {
  setBottomPanelVisible,
  setSecondaryPanelVisible,
  setSidebarVisible,
} from '../core/state/layout';
import {
  registerAndOpenTab,
  removeTab
} from '../core/state/workspace';
import { TabCloseGuard } from './models/tab-item.model';
import { ShellTab } from './contracts/ShellTab';
import { DockZone } from '../core/models/dock-zone-assignment.model';
import { ToolbarAction } from './models/toolbar-action.model';
import { ISidebarEntry, IToolbarAction } from './contracts';
import { addSidebarEntry, addToolbarAction } from '../core/state/shell-content';
import { SidebarItem } from './models/sidebar-item.model';

/**
 * Composition root for shell content registration.
 */
@Injectable({ providedIn: 'root' })
export class ShellManager {
  private readonly tabIds = new Set<string>();
  private readonly sidebarIds = new Set<string>();
  private readonly toolbarIds = new Set<string>();

  constructor(
    private readonly store: Store<AppState>,
    private readonly commandRegistry: CommandRegistryService
  ) {}



  addTab(tab: ShellTab, zone: DockZone, guard?: TabCloseGuard): void {
    if (this.tabIds.has(tab.id)) {
      console.warn(`[ShellManager] Duplicate tab id '${tab.id}' ignored.`);
      return;
    }

    this.tabIds.add(tab.id);

    this.store.dispatch(registerAndOpenTab({ tab: tab , zone: zone }));
  }


  addSidebarEntry(entry: ISidebarEntry): void {
    if (this.sidebarIds.has(entry.id)) {
      console.warn(`[ShellManager] Duplicate sidebar entry id '${entry.id}' ignored.`);
      return;
    }

    this.sidebarIds.add(entry.id);

    const sidebarItem: SidebarItem = {
      id: entry.id,
      label: entry.label,
      icon: entry.icon,
      tooltip: entry.tooltip ?? entry.label,
      position: 'top',
      component: entry.component,
    };

    this.store.dispatch(addSidebarEntry(sidebarItem));
  }


  addToolbarAction(action: IToolbarAction): void {
    if (this.toolbarIds.has(action.id)) {
      console.warn(`[ShellManager] Duplicate toolbar action id '${action.id}' ignored.`);
      return;
    }

    this.toolbarIds.add(action.id);

    const commandId = `shell.action.${action.id}`;
    this.commandRegistry.register({
      id: commandId,
      label: action.label,
      execute: action.handler,
    });

    const toolbarAction: ToolbarAction = {
      id: action.id,
      label: action.label,
      icon: action.icon,
      tooltip: action.tooltip ?? action.label,
      commandId,
      group: 'primary',
    };

    this.store.dispatch(addToolbarAction(toolbarAction));
  }

  setSidebarVisible(visible: boolean): void {
    this.store.dispatch(setSidebarVisible({ visible }));
  }

  setBottomPanelVisible(visible: boolean): void {
    this.store.dispatch(setBottomPanelVisible({ visible }));
  }

  setSecondaryPanelVisible(visible: boolean): void {
    this.store.dispatch(setSecondaryPanelVisible({ visible }));
  }

  removeTab(tabId: string): void {
    this.tabIds.delete(tabId);
    this.store.dispatch(removeTab({ tabId }));
  }

}
