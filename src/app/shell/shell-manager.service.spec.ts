import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngrx/store';
import { CommandRegistryService } from '../core/services/command-registry.service';
import {
  setBottomPanelVisible,
  setSecondaryPanelVisible,
  setSidebarVisible,
} from '../core/state/layout';
import {
  addSidebarEntry,
  addToolbarAction,
} from '../core/state/shell-content';
import {
  registerAndOpenTab
} from '../core/state/workspace';
import { commandTelemetryReducer, selectLastExecution } from '../core/state/command-telemetry';
import { ShellManager } from './shell-manager.service';


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
