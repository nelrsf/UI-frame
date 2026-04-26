import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';
import { AppEvent } from '../models/app-event.model';
import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('emit / on contract', () => {
    it('should deliver a typed event to a subscriber', (done) => {
      service.on('shell.ready.v1').subscribe((event: AppEvent<'shell.ready.v1'>) => {
        expect(event.eventName).toBe('shell.ready.v1');
        expect(event.payload).toEqual({});
        expect(typeof event.timestamp).toBe('number');
        expect(event.origin).toBe('test-origin');
        done();
      });

      service.emit('shell.ready.v1', {}, 'test-origin');
    });

    it('should deliver event payload to multiple subscribers', () => {
      const received: string[] = [];

      service.on('sidebar.collapsed.v1').subscribe((e) => received.push('A:' + e.payload.collapsed));
      service.on('sidebar.collapsed.v1').subscribe((e) => received.push('B:' + e.payload.collapsed));

      service.emit('sidebar.collapsed.v1', { collapsed: true });

      expect(received).toEqual(['A:true', 'B:true']);
    });

    it('should not deliver events to subscribers of a different channel', () => {
      const received: string[] = [];

      service.on('sidebar.collapsed.v1').subscribe(() => received.push('sidebar'));
      service.emit('tabs.active.changed.v1', { tabId: 'tab-1' });

      expect(received).toEqual([]);
    });

    it('should include a timestamp close to the current time', (done) => {
      const before = Date.now();

      service.on('command.executed.v1').subscribe((event) => {
        const after = Date.now();
        expect(event.timestamp).toBeGreaterThanOrEqual(before);
        expect(event.timestamp).toBeLessThanOrEqual(after);
        done();
      });

      service.emit('command.executed.v1', { commandId: 'cmd-1', success: true, timestamp: Date.now() });
    });

    it('should deliver events to existing subscribers when a new subscriber is added mid-stream', () => {
      const received: number[] = [];

      service.on('sidebar.resized.v1').subscribe((e) => received.push(e.payload.width));

      service.emit('sidebar.resized.v1', { width: 100 });

      service.on('sidebar.resized.v1').subscribe((e) => received.push(e.payload.width));

      service.emit('sidebar.resized.v1', { width: 200 });

      expect(received).toEqual([100, 200, 200]);
    });
  });

  describe('off — unsubscribe', () => {
    it('should stop delivering events after off() is called', () => {
      const received: boolean[] = [];
      const sub: Subscription = service
        .on('bottomPanel.toggled.v1')
        .subscribe((e) => received.push(e.payload.visible));

      service.emit('bottomPanel.toggled.v1', { visible: true });
      service.off('bottomPanel.toggled.v1', sub);
      service.emit('bottomPanel.toggled.v1', { visible: false });

      expect(received).toEqual([true]);
    });

    it('should allow other subscribers to keep receiving events after one is unsubscribed', () => {
      const first: boolean[] = [];
      const second: boolean[] = [];

      const sub1 = service.on('bottomPanel.toggled.v1').subscribe((e) => first.push(e.payload.visible));
      service.on('bottomPanel.toggled.v1').subscribe((e) => second.push(e.payload.visible));

      service.emit('bottomPanel.toggled.v1', { visible: true });
      service.off('bottomPanel.toggled.v1', sub1);
      service.emit('bottomPanel.toggled.v1', { visible: false });

      expect(first).toEqual([true]);
      expect(second).toEqual([true, false]);
    });
  });

  describe('error isolation', () => {
    it('should not break subsequent listeners when one listener throws', () => {
      const received: string[] = [];

      service.on('tabs.active.changed.v1').subscribe(() => {
        throw new Error('listener A failure');
      });

      service.on('tabs.active.changed.v1').subscribe((e) => {
        received.push(e.payload.tabId);
      });

      expect(() => service.emit('tabs.active.changed.v1', { tabId: 'tab-42' })).not.toThrow();
      expect(received).toEqual(['tab-42']);
    });

    it('should log an error to console when a listener throws', () => {
      const consoleSpy = spyOn(console, 'error');

      service.on('tabs.reordered.v1').subscribe(() => {
        throw new Error('boom');
      });

      service.emit('tabs.reordered.v1', { tabIds: ['a', 'b'] });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus] Isolated listener error for event',
        'tabs.reordered.v1',
        jasmine.any(Error)
      );
    });
  });

  describe('dev-mode traceability', () => {
    it('should log structured event info to console in dev mode', () => {
      const consoleSpy = spyOn(console, 'log');

      service.emit('shell.layout.changed.v1', { layout: 'default' }, 'layout-service');

      // isDevMode() returns true in test environment
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EventBus]',
        jasmine.objectContaining({
          eventName: 'shell.layout.changed.v1',
          origin: 'layout-service',
          payload: { layout: 'default' },
        })
      );
    });
  });
});
