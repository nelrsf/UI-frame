import { TestBed } from '@angular/core/testing';
import { AppEvent } from '../models/app-event.model';
import { CommandRegistryService } from './command-registry.service';
import { EventBusService } from './event-bus.service';

describe('CommandRegistryService', () => {
  let service: CommandRegistryService;
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandRegistryService);
    eventBus = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // register / list
  // ---------------------------------------------------------------------------

  describe('register / list', () => {
    it('should register a command and include it in list()', () => {
      service.register({ id: 'cmd.a', label: 'Command A', execute: () => {} });
      const commands = service.list();
      expect(commands.length).toBe(1);
      expect(commands[0].id).toBe('cmd.a');
      expect(commands[0].label).toBe('Command A');
    });

    it('should overwrite a command with the same id', () => {
      service.register({ id: 'cmd.a', label: 'First', execute: () => {} });
      service.register({ id: 'cmd.a', label: 'Second', execute: () => {} });
      const commands = service.list();
      expect(commands.length).toBe(1);
      expect(commands[0].label).toBe('Second');
    });

    it('should register multiple commands', () => {
      service.register({ id: 'cmd.a', label: 'A', execute: () => {} });
      service.register({ id: 'cmd.b', label: 'B', execute: () => {} });
      expect(service.list().length).toBe(2);
    });

    it('list() should include optional metadata', () => {
      service.register({
        id: 'cmd.c',
        label: 'C',
        shortcut: 'Ctrl+C',
        context: 'editor',
        execute: () => {},
      });
      const cmd = service.list()[0];
      expect(cmd.shortcut).toBe('Ctrl+C');
      expect(cmd.context).toBe('editor');
    });

    it('list() should return an immutable snapshot (not the live internal collection)', () => {
      service.register({ id: 'cmd.a', label: 'A', execute: () => {} });
      const snapshot = service.list();
      service.register({ id: 'cmd.b', label: 'B', execute: () => {} });
      expect(snapshot.length).toBe(1);
    });
  });

  // ---------------------------------------------------------------------------
  // execute — success path
  // ---------------------------------------------------------------------------

  describe('execute — success', () => {
    it('should invoke the registered handler', async () => {
      let called = false;
      service.register({ id: 'cmd.run', label: 'Run', execute: () => { called = true; } });
      await service.execute('cmd.run');
      expect(called).toBeTrue();
    });

    it('should await async handlers before resolving', async () => {
      const order: string[] = [];
      service.register({
        id: 'cmd.async',
        label: 'Async',
        execute: async () => {
          await Promise.resolve();
          order.push('handler');
        },
      });
      await service.execute('cmd.async');
      order.push('after');
      expect(order).toEqual(['handler', 'after']);
    });

    it('should emit command.executed.v1 with success=true after execution', async () => {
      const events: AppEvent<'command.executed.v1'>[] = [];
      eventBus.on('command.executed.v1').subscribe((e) => events.push(e));

      service.register({ id: 'cmd.ok', label: 'OK', execute: () => {} });
      await service.execute('cmd.ok');

      expect(events.length).toBe(1);
      expect(events[0].payload.commandId).toBe('cmd.ok');
      expect(events[0].payload.success).toBeTrue();
      expect(typeof events[0].payload.timestamp).toBe('number');
    });

    it('should include the command context in the emitted event', async () => {
      const events: AppEvent<'command.executed.v1'>[] = [];
      eventBus.on('command.executed.v1').subscribe((e) => events.push(e));

      service.register({ id: 'cmd.ctx', label: 'Ctx', context: 'editor', execute: () => {} });
      await service.execute('cmd.ctx');

      expect(events[0].payload.context).toBe('editor');
    });

    it('should emit event with origin "command-registry"', async () => {
      const events: AppEvent<'command.executed.v1'>[] = [];
      eventBus.on('command.executed.v1').subscribe((e) => events.push(e));

      service.register({ id: 'cmd.origin', label: 'Origin', execute: () => {} });
      await service.execute('cmd.origin');

      expect(events[0].origin).toBe('command-registry');
    });
  });

  // ---------------------------------------------------------------------------
  // execute — error path
  // ---------------------------------------------------------------------------

  describe('execute — error handling', () => {
    it('should not throw when the handler throws synchronously', async () => {
      service.register({ id: 'cmd.fail', label: 'Fail', execute: () => { throw new Error('boom'); } });
      await expectAsync(service.execute('cmd.fail')).toBeResolved();
    });

    it('should not throw when the handler returns a rejected promise', async () => {
      service.register({
        id: 'cmd.reject',
        label: 'Reject',
        execute: async () => { throw new Error('async boom'); },
      });
      await expectAsync(service.execute('cmd.reject')).toBeResolved();
    });

    it('should emit command.executed.v1 with success=false when handler throws', async () => {
      const events: AppEvent<'command.executed.v1'>[] = [];
      eventBus.on('command.executed.v1').subscribe((e) => events.push(e));

      service.register({ id: 'cmd.fail', label: 'Fail', execute: () => { throw new Error('fail'); } });
      await service.execute('cmd.fail');

      expect(events.length).toBe(1);
      expect(events[0].payload.commandId).toBe('cmd.fail');
      expect(events[0].payload.success).toBeFalse();
    });

    it('should log the error to console when handler throws', async () => {
      const consoleSpy = spyOn(console, 'error');
      const err = new Error('handler error');
      service.register({ id: 'cmd.err', label: 'Err', execute: () => { throw err; } });
      await service.execute('cmd.err');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[CommandRegistry] Command execution failed:',
        'cmd.err',
        err
      );
    });
  });

  // ---------------------------------------------------------------------------
  // execute — unknown command
  // ---------------------------------------------------------------------------

  describe('execute — unknown command', () => {
    it('should resolve without throwing for an unregistered id', async () => {
      await expectAsync(service.execute('nonexistent')).toBeResolved();
    });

    it('should emit command.executed.v1 with success=false for unknown id', async () => {
      const events: AppEvent<'command.executed.v1'>[] = [];
      eventBus.on('command.executed.v1').subscribe((e) => events.push(e));

      await service.execute('unknown.cmd');

      expect(events.length).toBe(1);
      expect(events[0].payload.commandId).toBe('unknown.cmd');
      expect(events[0].payload.success).toBeFalse();
    });

    it('should warn to console for an unknown id', async () => {
      const warnSpy = spyOn(console, 'warn');
      await service.execute('missing.id');
      expect(warnSpy).toHaveBeenCalledWith('[CommandRegistry] Unknown command id:', 'missing.id');
    });
  });

  // ---------------------------------------------------------------------------
  // EventBus audit — timestamp
  // ---------------------------------------------------------------------------

  describe('execute — event timestamp', () => {
    it('should include a timestamp close to the current time in the event payload', async () => {
      const events: AppEvent<'command.executed.v1'>[] = [];
      eventBus.on('command.executed.v1').subscribe((e) => events.push(e));

      const before = Date.now();
      service.register({ id: 'cmd.ts', label: 'TS', execute: () => {} });
      await service.execute('cmd.ts');
      const after = Date.now();

      expect(events[0].payload.timestamp).toBeGreaterThanOrEqual(before);
      expect(events[0].payload.timestamp).toBeLessThanOrEqual(after);
    });
  });
});
