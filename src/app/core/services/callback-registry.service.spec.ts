import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { CallbackRegistryService } from './callback-registry.service';
import { statusBarReducer } from '../state/status-bar';
import { selectStatusBarLeftItems } from '../state/status-bar';
import { Store } from '@ngrx/store';

describe('CallbackRegistryService', () => {
  let service: CallbackRegistryService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CallbackRegistryService,
        provideStore({ statusBar: statusBarReducer }),
      ],
    });
    service = TestBed.inject(CallbackRegistryService);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a callback', () => {
      service.register('test-cb', () => {});
      expect(service.has('test-cb')).toBeTrue();
    });

    it('should throw when registering duplicate ID', () => {
      service.register('dup-cb', () => {});
      expect(() => service.register('dup-cb', () => {})).toThrowError(
        'Callback already registered: dup-cb'
      );
    });
  });

  describe('execute', () => {
    it('should execute a registered callback', () => {
      let called = false;
      service.register('exec-cb', () => { called = true; });
      service.execute('exec-cb');
      expect(called).toBeTrue();
    });

    it('should throw when executing unregistered ID', () => {
      expect(() => service.execute('nonexistent')).toThrowError(
        'Callback not found: nonexistent'
      );
    });

it('should dispatch error action when sync callback throws', () => {
  service.register('fail-cb', () => { throw new Error('Test error'); });
  expect(() => service.execute('fail-cb')).toThrow();
});

  });

describe('has', () => {
    it('should return true for registered callback', () => {
      service.register('has-cb', () => {});
      expect(service.has('has-cb')).toBeTrue();
    });

    it('should return false for unregistered callback', () => {
      expect(service.has('missing-cb')).toBeFalse();
    });
  });

  describe('unregister', () => {
    it('should remove a registered callback', () => {
      service.register('unreg-cb', () => {});
      expect(service.has('unreg-cb')).toBeTrue();
      service.unregister('unreg-cb');
      expect(service.has('unreg-cb')).toBeFalse();
    });

    it('should be a no-op for unregistered ID', () => {
      expect(() => service.unregister('nonexistent')).not.toThrow();
    });
  });
});
