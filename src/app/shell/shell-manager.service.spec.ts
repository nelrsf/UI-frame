import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { EventBusService } from '../core/services/event-bus.service';
import { CommandRegistryService } from '../core/services/command-registry.service';
import { addBottomPanelEntry, addShellTab, addSidebarEntry, addToolbarAction } from '../core/state/shell-content';
import { ShellManager } from './shell-manager.service';

describe('ShellManager', () => {
  let shellManager: ShellManager;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;
  let commandRegistry: CommandRegistryService;
  let registerSpy: jasmine.Spy;
  let eventBus: jasmine.SpyObj<EventBusService>;

  beforeEach(() => {
    eventBus = jasmine.createSpyObj<EventBusService>('EventBusService', ['emit']);

    TestBed.configureTestingModule({
      providers: [
        ShellManager,
        provideMockStore(),
        CommandRegistryService,
        { provide: EventBusService, useValue: eventBus },
      ],
    });

    shellManager = TestBed.inject(ShellManager);
    store = TestBed.inject(MockStore);
    commandRegistry = TestBed.inject(CommandRegistryService);
    dispatchSpy = spyOn(store, 'dispatch');
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
      })
    );
  });

  it('addSidebarEntry dispatches addSidebarEntry', () => {
    shellManager.addSidebarEntry({
      id: 'reports',
      label: 'Reports',
      icon: 'description',
      tooltip: 'Open reports',
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      addSidebarEntry({
        id: 'reports',
        label: 'Reports',
        icon: 'description',
        tooltip: 'Open reports',
        position: 'top',
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
    shellManager.addBottomPanelEntry({
      id: 'results',
      label: 'Results',
      icon: 'list',
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      addBottomPanelEntry({
        id: 'results',
        label: 'Results',
        icon: 'list',
        closable: false,
      })
    );
  });

  it('duplicate ids are ignored', () => {
    const componentType = class {};

    shellManager.addTab({ id: 'dashboard', label: 'Dashboard', component: componentType });
    shellManager.addTab({ id: 'dashboard', label: 'Dashboard', component: componentType });

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
    expect(eventBus.emit).toHaveBeenCalledWith(
      'command.executed.v1',
      jasmine.objectContaining({ commandId: 'shell.action.danger', success: false }),
      'command-registry'
    );
  });
});
