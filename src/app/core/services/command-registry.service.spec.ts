import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { Store } from '@ngrx/store';
import { CommandRegistryService } from './command-registry.service';
import { commandTelemetryReducer, selectRecentExecutions, selectLastExecution } from '../state/command-telemetry';

describe('CommandRegistryService', () => {
  let service: CommandRegistryService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideStore({ commandTelemetry: commandTelemetryReducer }),
      ],
    });
    service = TestBed.inject(CommandRegistryService);
    store = TestBed.inject(Store);
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

    it('should dispatch commandExecuted action with success=true after execution', async () => {
      service.register({ id: 'cmd.ok', label: 'OK', execute: () => {} });
      await service.execute('cmd.ok');

      const executions = await new Promise<any[]>((resolve) => {
        store.select(selectRecentExecutions(10)).subscribe(resolve);
      });

      expect(executions.length).toBeGreaterThanOrEqual(1);
      const record = executions.find((e) => e.commandId === 'cmd.ok');
      expect(record).toBeDefined();
      expect(record.success).toBeTrue();
      expect(typeof record.timestamp).toBe('number');
    });

    it('should include the command context in the telemetry record', async () => {
      service.register({ id: 'cmd.ctx', label: 'Ctx', context: 'editor', execute: () => {} });
      await service.execute('cmd.ctx');

      const record = await new Promise<any>((resolve) => {
        store.select(selectLastExecution('cmd.ctx')).subscribe(resolve);
      });

      expect(record.context).toBe('editor');
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

    it('should dispatch commandExecuted action with success=false when handler throws', async () => {
      service.register({ id: 'cmd.fail', label: 'Fail', execute: () => { throw new Error('fail'); } });
      await service.execute('cmd.fail');

      const record = await new Promise<any>((resolve) => {
        store.select(selectLastExecution('cmd.fail')).subscribe(resolve);
      });

      expect(record).toBeDefined();
      expect(record.commandId).toBe('cmd.fail');
      expect(record.success).toBeFalse();
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

    it('should dispatch commandExecuted action with success=false for unknown id', async () => {
      await service.execute('unknown.cmd');

      const record = await new Promise<any>((resolve) => {
        store.select(selectLastExecution('unknown.cmd')).subscribe(resolve);
      });

      expect(record).toBeDefined();
      expect(record.commandId).toBe('unknown.cmd');
      expect(record.success).toBeFalse();
    });

    it('should warn to console for an unknown id', async () => {
      const warnSpy = spyOn(console, 'warn');
      await service.execute('missing.id');
      expect(warnSpy).toHaveBeenCalledWith('[CommandRegistry] Unknown command id:', 'missing.id');
    });
  });

  // ---------------------------------------------------------------------------
  // telemetry — timestamp
  // ---------------------------------------------------------------------------

  describe('execute — telemetry timestamp', () => {
    it('should include a timestamp close to the current time in the telemetry record', async () => {
      const before = Date.now();
      service.register({ id: 'cmd.ts', label: 'TS', execute: () => {} });
      await service.execute('cmd.ts');
      const after = Date.now();

      const record = await new Promise<any>((resolve) => {
        store.select(selectLastExecution('cmd.ts')).subscribe(resolve);
      });

      expect(record.timestamp).toBeGreaterThanOrEqual(before);
      expect(record.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // ---------------------------------------------------------------------------
  // UI integration metadata — icon, description, category
  // ---------------------------------------------------------------------------

  describe('UI integration metadata', () => {
    it('list() should include optional icon field', () => {
      service.register({ id: 'cmd.icon', label: 'Icon', icon: 'save', execute: () => {} });
      expect(service.list()[0].icon).toBe('save');
    });

    it('list() should include optional description field', () => {
      service.register({ id: 'cmd.desc', label: 'Desc', description: 'Save the file', execute: () => {} });
      expect(service.list()[0].description).toBe('Save the file');
    });

    it('list() should include optional category field', () => {
      service.register({ id: 'cmd.cat', label: 'Cat', category: 'File', execute: () => {} });
      expect(service.list()[0].category).toBe('File');
    });

    it('list() should include all UI metadata fields together', () => {
      service.register({
        id: 'cmd.full',
        label: 'Full',
        shortcut: 'Ctrl+S',
        context: 'editor',
        icon: 'save',
        description: 'Save the current file',
        category: 'File',
        execute: () => {},
      });
      const cmd = service.list()[0];
      expect(cmd.icon).toBe('save');
      expect(cmd.description).toBe('Save the current file');
      expect(cmd.category).toBe('File');
    });
  });

  // ---------------------------------------------------------------------------
  // getById
  // ---------------------------------------------------------------------------

  describe('getById', () => {
    it('should return the registered command for a known id', () => {
      service.register({ id: 'cmd.x', label: 'X', execute: () => {} });
      const cmd = service.getById('cmd.x');
      expect(cmd).toBeDefined();
      expect(cmd!.id).toBe('cmd.x');
      expect(cmd!.label).toBe('X');
    });

    it('should return undefined for an unknown id', () => {
      expect(service.getById('nonexistent.id')).toBeUndefined();
    });

    it('should reflect the latest registration after overwrite', () => {
      service.register({ id: 'cmd.y', label: 'First', execute: () => {} });
      service.register({ id: 'cmd.y', label: 'Second', execute: () => {} });
      expect(service.getById('cmd.y')!.label).toBe('Second');
    });

    it('should return the command including all metadata fields', () => {
      service.register({
        id: 'cmd.meta',
        label: 'Meta',
        shortcut: 'Ctrl+M',
        context: 'global',
        icon: 'menu',
        description: 'Open menu',
        category: 'View',
        execute: () => {},
      });
      const cmd = service.getById('cmd.meta');
      expect(cmd).toBeDefined();
      expect(cmd!.shortcut).toBe('Ctrl+M');
      expect(cmd!.context).toBe('global');
      expect(cmd!.icon).toBe('menu');
      expect(cmd!.description).toBe('Open menu');
      expect(cmd!.category).toBe('View');
    });
  });
});
