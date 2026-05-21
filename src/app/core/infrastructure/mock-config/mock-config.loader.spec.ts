import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { MockConfigLoader } from './mock-config.loader';
import { statusBarReducer } from '../../state/status-bar';
import { selectStatusBarLeftItems, selectStatusBarRightItems } from '../../state/status-bar';
import { Store } from '@ngrx/store';

describe('MockConfigLoader', () => {
  let loader: MockConfigLoader;
  let store: Store;

  const mockConfig = {
    items: [
      { id: 'item1', label: 'Left Item', clickable: false, position: 'left' as const },
      { id: 'item2', label: 'Right Item', clickable: true, position: 'right' as const },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockConfigLoader,
        provideStore({ statusBar: statusBarReducer }),
      ],
    });
    loader = TestBed.inject(MockConfigLoader);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(loader).toBeTruthy();
  });

  it('should load items and dispatch to store on successful fetch', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(mockConfig), { status: 200 }))
    );

    await loader.load();

    let leftItems: any[] = [];
    let rightItems: any[] = [];
    store.select(selectStatusBarLeftItems).subscribe((items) => { leftItems = items; });
    store.select(selectStatusBarRightItems).subscribe((items) => { rightItems = items; });

    expect(leftItems.length).toBe(1);
    expect(leftItems[0].id).toBe('item1');
    expect(rightItems.length).toBe(1);
    expect(rightItems[0].id).toBe('item2');
  });

  it('should handle missing configuration file gracefully', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response('', { status: 404 }))
    );

    const warnSpy = spyOn(console, 'warn');

    await loader.load();

    expect(warnSpy).toHaveBeenCalled();
  });

  it('should handle invalid JSON gracefully', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response('not valid json', { status: 200 }))
    );

    const errorSpy = spyOn(console, 'error');

    await loader.load();

    expect(errorSpy).toHaveBeenCalled();
  });

  it('should skip items with duplicate IDs', async () => {
    const configWithDuplicates = {
      items: [
        { id: 'dup', label: 'First', clickable: false, position: 'left' as const },
        { id: 'dup', label: 'Second', clickable: false, position: 'left' as const },
      ],
    };

    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(configWithDuplicates), { status: 200 }))
    );

    const warnSpy = spyOn(console, 'warn');

    await loader.load();

    let leftItems: any[] = [];
    store.select(selectStatusBarLeftItems).subscribe((items) => { leftItems = items; });

    expect(leftItems.length).toBe(1);
    expect(warnSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Duplicate item id/));
  });

  it('should skip items with missing label', async () => {
    const configWithMissingLabel = {
      items: [
        { id: 'nolabel', label: '', clickable: false, position: 'left' as const },
      ],
    };

    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(configWithMissingLabel), { status: 200 }))
    );

    const warnSpy = spyOn(console, 'warn');

    await loader.load();

    expect(warnSpy).toHaveBeenCalledWith(jasmine.stringMatching(/missing or empty 'label'/));
  });

  it('should default position to left when not specified', async () => {
    const configNoPosition = {
      items: [
        { id: 'nopos', label: 'No Position', clickable: false },
      ],
    };

    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(JSON.stringify(configNoPosition), { status: 200 }))
    );

    await loader.load();

    let leftItems: any[] = [];
    store.select(selectStatusBarLeftItems).subscribe((items) => { leftItems = items; });

    expect(leftItems.length).toBe(1);
    expect(leftItems[0].id).toBe('nopos');
  });
});
