import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';
import { PreferencesEffects } from './preferences.effects';
import * as PreferencesActions from './preferences.actions';
import { PreferencesAdapter } from '../../infrastructure/electron/adapters/preferences.adapter';
import { initialPreferencesState, PreferencesState } from './preferences.reducer';
import { selectPreferencesState } from './preferences.selectors';

describe('PreferencesEffects', () => {
  let actions$: Subject<Action>;
  let effects: PreferencesEffects;
  let adapterSpy: jasmine.SpyObj<PreferencesAdapter>;
  let store: MockStore<{ preferences: PreferencesState }>;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    adapterSpy = jasmine.createSpyObj<PreferencesAdapter>('PreferencesAdapter', ['get', 'set']);

    TestBed.configureTestingModule({
      providers: [
        PreferencesEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { preferences: initialPreferencesState } }),
        { provide: PreferencesAdapter, useValue: adapterSpy },
      ],
    });

    effects = TestBed.inject(PreferencesEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
    actions$.complete();
  });

  // ---------------------------------------------------------------------------
  // loadPreferences$
  // ---------------------------------------------------------------------------

  describe('loadPreferences$', () => {
    it('should dispatch loadPreferencesSuccess with the data returned by the adapter', (done) => {
      const data = { theme: 'dark', fontSize: 14 };
      adapterSpy.get.and.returnValue(Promise.resolve(data));

      effects.loadPreferences$.subscribe((action) => {
        expect(action).toEqual(
          PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-1', data })
        );
        done();
      });

      actions$.next(PreferencesActions.loadPreferences({ workspaceId: 'ws-1' }));
    });

    it('should dispatch loadPreferencesSuccess with an empty map when the adapter returns {}', (done) => {
      adapterSpy.get.and.returnValue(Promise.resolve({}));

      effects.loadPreferences$.subscribe((action) => {
        expect(action).toEqual(
          PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-empty', data: {} })
        );
        done();
      });

      actions$.next(PreferencesActions.loadPreferences({ workspaceId: 'ws-empty' }));
    });

    it('should pass the workspaceId as the key and {} as the default to the adapter', (done) => {
      adapterSpy.get.and.returnValue(Promise.resolve({}));

      effects.loadPreferences$.subscribe(() => {
        expect(adapterSpy.get).toHaveBeenCalledOnceWith('ws-keyed', {});
        done();
      });

      actions$.next(PreferencesActions.loadPreferences({ workspaceId: 'ws-keyed' }));
    });

    it('should include the workspaceId in the success action', (done) => {
      adapterSpy.get.and.returnValue(Promise.resolve({ compact: true }));

      effects.loadPreferences$.subscribe((action) => {
        expect(
          (action as ReturnType<typeof PreferencesActions.loadPreferencesSuccess>).workspaceId
        ).toBe('ws-id-check');
        done();
      });

      actions$.next(PreferencesActions.loadPreferences({ workspaceId: 'ws-id-check' }));
    });

    it('should dispatch loadPreferencesFailure when the adapter rejects', (done) => {
      adapterSpy.get.and.returnValue(Promise.reject(new Error('IPC error')));

      effects.loadPreferences$.subscribe((action) => {
        expect(action).toEqual(
          PreferencesActions.loadPreferencesFailure({ workspaceId: 'ws-fail', error: 'IPC error' })
        );
        done();
      });

      actions$.next(PreferencesActions.loadPreferences({ workspaceId: 'ws-fail' }));
    });

    it('should dispatch loadPreferencesFailure with a string message for non-Error rejections', (done) => {
      adapterSpy.get.and.returnValue(Promise.reject('network timeout'));

      effects.loadPreferences$.subscribe((action) => {
        expect(action).toEqual(
          PreferencesActions.loadPreferencesFailure({ workspaceId: 'ws-str-fail', error: 'network timeout' })
        );
        done();
      });

      actions$.next(PreferencesActions.loadPreferences({ workspaceId: 'ws-str-fail' }));
    });

    it('should use the defaultValue ({}) when the key is absent and the adapter returns the default', (done) => {
      // Adapter returns the empty-object default (as the real bridge would for a missing key).
      adapterSpy.get.and.returnValue(Promise.resolve({}));

      effects.loadPreferences$.subscribe((action) => {
        expect(action).toEqual(
          PreferencesActions.loadPreferencesSuccess({ workspaceId: 'ws-default', data: {} })
        );
        done();
      });

      actions$.next(PreferencesActions.loadPreferences({ workspaceId: 'ws-default' }));
    });
  });

  // ---------------------------------------------------------------------------
  // setPreference$
  // ---------------------------------------------------------------------------

  describe('setPreference$', () => {
    it('should call adapter.set with the workspace ID and the merged preferences', (done) => {
      adapterSpy.set.and.returnValue(Promise.resolve());
      store.overrideSelector(selectPreferencesState, {
        ...initialPreferencesState,
        workspaceId: 'ws-a',
        data: { existing: 1 },
      });
      store.refreshState();

      effects.setPreference$.subscribe(() => {
        expect(adapterSpy.set).toHaveBeenCalledOnceWith('ws-a', {
          existing: 1,
          theme: 'light',
        });
        done();
      });

      actions$.next(PreferencesActions.setPreference({ key: 'theme', value: 'light' }));
    });

    it('should dispatch setPreferenceSuccess with the key and value on success', (done) => {
      adapterSpy.set.and.returnValue(Promise.resolve());
      store.overrideSelector(selectPreferencesState, {
        ...initialPreferencesState,
        workspaceId: 'ws-b',
      });
      store.refreshState();

      effects.setPreference$.subscribe((action) => {
        expect(action).toEqual(
          PreferencesActions.setPreferenceSuccess({ key: 'compact', value: true })
        );
        done();
      });

      actions$.next(PreferencesActions.setPreference({ key: 'compact', value: true }));
    });

    it('should dispatch setPreferenceSuccess even when adapter.set rejects', (done) => {
      adapterSpy.set.and.returnValue(Promise.reject(new Error('write failed')));
      store.overrideSelector(selectPreferencesState, {
        ...initialPreferencesState,
        workspaceId: 'ws-c',
      });
      store.refreshState();

      effects.setPreference$.subscribe((action) => {
        expect(action.type).toBe(PreferencesActions.setPreferenceSuccess.type);
        done();
      });

      actions$.next(PreferencesActions.setPreference({ key: 'key', value: 'val' }));
    });

    it('should merge the new key into existing data without discarding other keys', (done) => {
      adapterSpy.set.and.returnValue(Promise.resolve());
      store.overrideSelector(selectPreferencesState, {
        ...initialPreferencesState,
        workspaceId: 'ws-merge',
        data: { alpha: 1, beta: 2 },
      });
      store.refreshState();

      effects.setPreference$.subscribe(() => {
        expect(adapterSpy.set).toHaveBeenCalledOnceWith('ws-merge', {
          alpha: 1,
          beta: 2,
          gamma: 3,
        });
        done();
      });

      actions$.next(PreferencesActions.setPreference({ key: 'gamma', value: 3 }));
    });

    it('should overwrite an existing key when set is called again', (done) => {
      adapterSpy.set.and.returnValue(Promise.resolve());
      store.overrideSelector(selectPreferencesState, {
        ...initialPreferencesState,
        workspaceId: 'ws-overwrite',
        data: { theme: 'dark' },
      });
      store.refreshState();

      effects.setPreference$.subscribe(() => {
        expect(adapterSpy.set).toHaveBeenCalledOnceWith('ws-overwrite', { theme: 'light' });
        done();
      });

      actions$.next(PreferencesActions.setPreference({ key: 'theme', value: 'light' }));
    });
  });
});
