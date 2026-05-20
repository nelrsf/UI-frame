import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { CommandRegistryService } from '../core/services/command-registry.service';
import {
  setBottomPanelVisible,
  setSecondaryPanelVisible,
  setSidebarVisible,
} from '../core/state/layout';
import {
  addBottomPanelEntry,
  addSecondaryPanelEntry,
  addShellTab,
  addSidebarEntry,
  addToolbarAction,
} from '../core/state/shell-content';
import { commandTelemetryReducer, selectLastExecution } from '../core/state/command-telemetry';
import { ShellManager } from './shell-manager.service';
import { TabCloseGuard } from './models/tab-item.model';

describe('ShellManager', () => {
  let shellManager: ShellManager;
  let store: Store;
  let dispatchSpy: jasmine.Spy;
  let commandRegistry: CommandRegistryService;
  let registerSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ShellManager,
        provideStore({ commandTelemetry: commandTelemetryReducer }),
        CommandRegistryService,
      ],
    });

    shellManager = TestBed.inject(ShellManager);
    store = TestBed.inject(Store);
    commandRegistry = TestBed.inject(CommandRegistryService);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    registerSpy = spyOn(commandRegistry, 'register').and.callThrough();
  });

  it('addTab dispatches addShellTab', () => {
    const componentType = class {};

    shellManager.addTab({
      id: 'dashboard',
      label: 'Dashboard',
      component: componentType,
      icon: 'dashboard',
      closable: false,
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      addShellTab({
        tabItem: {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          closable: false,
          dirty: false,
          pinned: false,
          groupId: 'main',
        },
        componentType,
        guard: undefined,
      })
    );
  });

  it('addTab with guard dispatches addShellTab including the guard', () => {
    const componentType = class {};
    const guard: TabCloseGuard = { beforeClose: () => false };

    shellManager.addTab(
      {
        id: 'editor',
        label: 'Editor',
        component: componentType,
        closable: true,
      },
      guard
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      addShellTab({
        tabItem: {
          id: 'editor',
          label: 'Editor',
          icon: undefined,
          closable: true,
          dirty: false,
          pinned: false,
          groupId: 'main',
        },
        componentType,
        guard,
      })
    );
  });

  it('addSidebarEntry dispatches addSidebarEntry', () => {
    const componentType = class {};

    shellManager.addSidebarEntry({
      id: 'reports',
      label: 'Reports',
      icon: 'description',
      tooltip: 'Open reports',
      component: componentType,
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      addSidebarEntry({
        id: 'reports',
        label: 'Reports',
        icon: 'description',
        tooltip: 'Open reports',
        position: 'top',
        component: componentType,
      })
    );
  });

  it('addToolbarAction registers command and dispatches addToolbarAction', () => {
    const handler = jasmine.createSpy('handler');

    shellManager.addToolbarAction({
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh',
      handler,
      tooltip: 'Refresh data',
    });

    expect(registerSpy).toHaveBeenCalledWith({
      id: 'shell.action.refresh',
      label: 'Refresh',
      execute: handler,
    });
    expect(dispatchSpy).toHaveBeenCalledWith(
      addToolbarAction({
        id: 'refresh',
        label: 'Refresh',
        icon: 'refresh',
        tooltip: 'Refresh data',
        commandId: 'shell.action.refresh',
        group: 'primary',
      })
    );
  });

  it('addBottomPanelEntry dispatches addBottomPanelEntry', () => {
    const componentType = class {};

    shellManager.addBottomPanelEntry({
      id: 'results',
      label: 'Results',
      icon: 'list',
      component: componentType,
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      addBottomPanelEntry({
        id: 'results',
        label: 'Results',
        icon: 'list',
        closable: false,
        component: componentType,
      })
    );
  });

  it('duplicate ids are ignored', () => {
    const componentType = class {};

    shellManager.addTab({ id: 'dashboard', label: 'Dashboard', component: componentType });
    shellManager.addTab({ id: 'dashboard', label: 'Dashboard', component: componentType });

    expect(dispatchSpy.calls.count()).toBe(1);
  });

  it('addSecondaryPanelEntry dispatches addSecondaryPanelEntry', () => {
    const componentType = class {};

    shellManager.addSecondaryPanelEntry({
      id: 'secondary-weather',
      label: 'Weather',
      icon: 'sun',
      component: componentType,
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      addSecondaryPanelEntry({
        entry: {
          id: 'secondary-weather',
          label: 'Weather',
          icon: 'sun',
          component: componentType,
        },
      })
    );
  });

  it('duplicate secondary panel entry ids are ignored', () => {
    const componentType = class {};

    shellManager.addSecondaryPanelEntry({
      id: 'secondary-weather',
      label: 'Weather',
      component: componentType,
    });
    shellManager.addSecondaryPanelEntry({
      id: 'secondary-weather',
      label: 'Weather 2',
      component: componentType,
    });

    expect(dispatchSpy.calls.count()).toBe(1);
  });

  it('throwing handler does not propagate when executed via CommandRegistry', async () => {
    const error = new Error('boom');
    const handler = () => {
      throw error;
    };

    shellManager.addToolbarAction({
      id: 'danger',
      label: 'Danger',
      icon: 'warning',
      handler,
    });

    await expectAsync(commandRegistry.execute('shell.action.danger')).toBeResolved();

    // Wait for NgRx state to settle before reading selector.
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const record = await new Promise<any>((resolve) => {
      TestBed.inject(Store).select(selectLastExecution('shell.action.danger')).subscribe(resolve);
    });
    expect(record.commandId).toBe('shell.action.danger');
    expect(record.success).toBeFalse();
  });

  it('setSidebarVisible dispatches setSidebarVisible with true', () => {
    shellManager.setSidebarVisible(true);
    expect(dispatchSpy).toHaveBeenCalledWith(setSidebarVisible({ visible: true }));
  });

  it('setSidebarVisible dispatches setSidebarVisible with false', () => {
    shellManager.setSidebarVisible(false);
    expect(dispatchSpy).toHaveBeenCalledWith(setSidebarVisible({ visible: false }));
  });

  it('setBottomPanelVisible dispatches setBottomPanelVisible with true', () => {
    shellManager.setBottomPanelVisible(true);
    expect(dispatchSpy).toHaveBeenCalledWith(setBottomPanelVisible({ visible: true }));
  });

  it('setBottomPanelVisible dispatches setBottomPanelVisible with false', () => {
    shellManager.setBottomPanelVisible(false);
    expect(dispatchSpy).toHaveBeenCalledWith(setBottomPanelVisible({ visible: false }));
  });

  it('setSecondaryPanelVisible dispatches setSecondaryPanelVisible with true', () => {
    shellManager.setSecondaryPanelVisible(true);
    expect(dispatchSpy).toHaveBeenCalledWith(setSecondaryPanelVisible({ visible: true }));
  });

  it('setSecondaryPanelVisible dispatches setSecondaryPanelVisible with false', () => {
    shellManager.setSecondaryPanelVisible(false);
    expect(dispatchSpy).toHaveBeenCalledWith(setSecondaryPanelVisible({ visible: false }));
  });
});
