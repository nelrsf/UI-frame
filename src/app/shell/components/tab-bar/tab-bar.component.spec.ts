import { TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { TabBarComponent } from './tab-bar.component';
import { TabItem, TabCloseGuard } from '../../models/tab-item.model';

const makeTab = (partial: Partial<TabItem> & { id: string; label: string }): TabItem => ({
  dirty: false,
  closable: true,
  pinned: false,
  groupId: 'main',
  ...partial,
});

describe('TabBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabBarComponent],
    }).compileComponents();
  });

  it('should create the tab-bar component', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the tab-bar container', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-bar"]')).not.toBeNull();
  });

  it('should render the new-tab button', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-bar-new-tab"]')).not.toBeNull();
  });

  it('should render tabs for each TabItem', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [
      makeTab({ id: 'tab-1', label: 'File.ts' }),
      makeTab({ id: 'tab-2', label: 'README.md' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-tab-1"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="tab-tab-2"]')).not.toBeNull();
  });

  it('should apply active class to the active tab', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts' })];
    fixture.componentInstance.activeTabId = 'tab-1';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const tab = compiled.querySelector('[data-testid="tab-tab-1"]');
    expect(tab?.classList.contains('tab-bar__tab--active')).toBeTrue();
  });

  it('should show dirty indicator when tab.dirty is true', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', dirty: true })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-dirty-indicator"]')).not.toBeNull();
  });

  it('should not show dirty indicator when tab.dirty is false', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', dirty: false })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-dirty-indicator"]')).toBeNull();
  });

  it('should render close button for closable tabs', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', closable: true })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-close-tab-1"]')).not.toBeNull();
  });

  it('should not render close button for non-closable tabs', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', closable: false })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-close-tab-1"]')).toBeNull();
  });

  it('should emit tabSelected when a tab is clicked', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts' })];
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabSelected, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="tab-tab-1"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith('tab-1');
  });

  it('should emit tabClosed when a close button is clicked', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', closable: true })];
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="tab-close-tab-1"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith('tab-1');
  });

  it('should emit newTabRequested when the new-tab button is clicked', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.newTabRequested, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="tab-bar-new-tab"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('should have role="tablist" on the container', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bar = compiled.querySelector('[data-testid="tab-bar"]');
    expect(bar?.getAttribute('role')).toBe('tablist');
  });

  it('should default to empty tabs, empty activeTabId and empty groupId', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    const component = fixture.componentInstance;
    expect(component.tabs).toEqual([]);
    expect(component.activeTabId).toBe('');
    expect(component.groupId).toBe('');
  });

  it('should expose tabReordered as an EventEmitter (reserved for drag-reorder)', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    expect(fixture.componentInstance.tabReordered).toBeDefined();
  });

  it('should set tabindex="0" on the active tab', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [
      makeTab({ id: 'tab-1', label: 'File.ts' }),
      makeTab({ id: 'tab-2', label: 'README.md' }),
    ];
    fixture.componentInstance.activeTabId = 'tab-1';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const activeTab = compiled.querySelector('[data-testid="tab-tab-1"]');
    const inactiveTab = compiled.querySelector('[data-testid="tab-tab-2"]');
    expect(activeTab?.getAttribute('tabindex')).toBe('0');
    expect(inactiveTab?.getAttribute('tabindex')).toBe('-1');
  });
});

// ---------------------------------------------------------------------------
// TabBarComponent — integration tests (tab lifecycle, docking, close guard)
// ---------------------------------------------------------------------------

describe('TabBarComponent — integration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabBarComponent],
    }).compileComponents();
  });

  // ── pinned tab close guard ─────────────────────────────────────────────

  describe('pinned tab close guard', () => {
    it('should not render a close button for a pinned tab', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [makeTab({ id: 'pinned', label: 'Pinned.ts', pinned: true, closable: true })];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="tab-close-pinned"]')).toBeNull();
    });

    it('should render a close button for an unpinned closable tab', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [makeTab({ id: 'normal', label: 'Normal.ts', pinned: false, closable: true })];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="tab-close-normal"]')).not.toBeNull();
    });

    it('should apply the pinned CSS class when tab.pinned is true', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [makeTab({ id: 'pinned', label: 'Pinned.ts', pinned: true })];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const tab = compiled.querySelector('[data-testid="tab-pinned"]');
      expect(tab?.classList.contains('tab-bar__tab--pinned')).toBeTrue();
    });

    it('should not apply the pinned CSS class when tab.pinned is false', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [makeTab({ id: 'normal', label: 'Normal.ts', pinned: false })];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const tab = compiled.querySelector('[data-testid="tab-normal"]');
      expect(tab?.classList.contains('tab-bar__tab--pinned')).toBeFalse();
    });
  });

  // ── dirty indicator (guarded close signal) ─────────────────────────────

  describe('dirty indicator as close-guard signal', () => {
    it('should show dirty indicators for all dirty tabs when multiple tabs are present', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [
        makeTab({ id: 'tab-1', label: 'A.ts', dirty: true }),
        makeTab({ id: 'tab-2', label: 'B.ts', dirty: false }),
        makeTab({ id: 'tab-3', label: 'C.ts', dirty: true }),
      ];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const indicators = compiled.querySelectorAll('[data-testid="tab-dirty-indicator"]');
      expect(indicators.length).toBe(2);
    });

    it('should remove the dirty indicator when a dirty tab is updated to clean', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      const tab = makeTab({ id: 'tab-1', label: 'A.ts', dirty: true });
      fixture.componentInstance.tabs = [tab];
      fixture.detectChanges();

      fixture.componentInstance.tabs = [{ ...tab, dirty: false }];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="tab-dirty-indicator"]')).toBeNull();
    });

    it('should show the dirty indicator when a clean tab becomes dirty', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      const tab = makeTab({ id: 'tab-1', label: 'A.ts', dirty: false });
      fixture.componentInstance.tabs = [tab];
      fixture.detectChanges();

      fixture.componentInstance.tabs = [{ ...tab, dirty: true }];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="tab-dirty-indicator"]')).not.toBeNull();
    });
  });

  // ── tab lifecycle rendering ────────────────────────────────────────────

  describe('tab lifecycle rendering', () => {
    it('should update the DOM when a tab is removed from the tabs input', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [
        makeTab({ id: 'tab-1', label: 'A.ts' }),
        makeTab({ id: 'tab-2', label: 'B.ts' }),
      ];
      fixture.detectChanges();

      fixture.componentInstance.tabs = [makeTab({ id: 'tab-2', label: 'B.ts' })];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="tab-tab-1"]')).toBeNull();
      expect(compiled.querySelector('[data-testid="tab-tab-2"]')).not.toBeNull();
    });

    it('should update the DOM when a new tab is added to the tabs input', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'A.ts' })];
      fixture.detectChanges();

      fixture.componentInstance.tabs = [
        makeTab({ id: 'tab-1', label: 'A.ts' }),
        makeTab({ id: 'tab-2', label: 'B.ts' }),
      ];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="tab-tab-2"]')).not.toBeNull();
    });

    it('should reflect active tab change when activeTabId input is updated', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [
        makeTab({ id: 'tab-1', label: 'A.ts' }),
        makeTab({ id: 'tab-2', label: 'B.ts' }),
      ];
      fixture.componentInstance.activeTabId = 'tab-1';
      fixture.detectChanges();

      fixture.componentInstance.activeTabId = 'tab-2';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const tab1 = compiled.querySelector('[data-testid="tab-tab-1"]');
      const tab2 = compiled.querySelector('[data-testid="tab-tab-2"]');
      expect(tab1?.classList.contains('tab-bar__tab--active')).toBeFalse();
      expect(tab2?.classList.contains('tab-bar__tab--active')).toBeTrue();
    });

    it('should render tabs in the order they appear in the tabs input', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [
        makeTab({ id: 'tab-a', label: 'A.ts' }),
        makeTab({ id: 'tab-b', label: 'B.ts' }),
        makeTab({ id: 'tab-c', label: 'C.ts' }),
      ];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const tabElements = compiled.querySelectorAll('[role="tab"]');
      const ids = Array.from(tabElements).map((el) => el.getAttribute('data-testid'));
      expect(ids).toEqual(['tab-tab-a', 'tab-tab-b', 'tab-tab-c']);
    });

    it('should reflect reordered tabs when the tabs input order changes', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [
        makeTab({ id: 'tab-1', label: 'A.ts' }),
        makeTab({ id: 'tab-2', label: 'B.ts' }),
      ];
      fixture.detectChanges();

      fixture.componentInstance.tabs = [
        makeTab({ id: 'tab-2', label: 'B.ts' }),
        makeTab({ id: 'tab-1', label: 'A.ts' }),
      ];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const tabElements = compiled.querySelectorAll('[role="tab"]');
      const ids = Array.from(tabElements).map((el) => el.getAttribute('data-testid'));
      expect(ids).toEqual(['tab-tab-2', 'tab-tab-1']);
    });
  });

  // ── docking zone label via groupId ─────────────────────────────────────

  describe('docking — groupId aria-label', () => {
    it('should set an aria-label containing the groupId for the tab list', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.groupId = 'primary-workspace';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const bar = compiled.querySelector('[data-testid="tab-bar"]');
      expect(bar?.getAttribute('aria-label')).toContain('primary-workspace');
    });

    it('should update the aria-label when the groupId input changes', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.groupId = 'bottom-panel';
      fixture.detectChanges();

      fixture.componentInstance.groupId = 'secondary-panel';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const bar = compiled.querySelector('[data-testid="tab-bar"]');
      expect(bar?.getAttribute('aria-label')).toContain('secondary-panel');
    });
  });

  // ── tabReordered event emitter ─────────────────────────────────────────

  describe('tabReordered event', () => {
    it('should be an EventEmitter with a { fromIndex, toIndex } shape', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      const emittedValues: { fromIndex: number; toIndex: number }[] = [];
      fixture.componentInstance.tabReordered.subscribe((v) => emittedValues.push(v));

      fixture.componentInstance.tabReordered.emit({ fromIndex: 0, toIndex: 2 });

      expect(emittedValues).toEqual([{ fromIndex: 0, toIndex: 2 }]);
    });
  });

  // ── tab icon rendering ─────────────────────────────────────────────────

  describe('tab icon rendering', () => {
    it('should render the icon span when tab.icon is set', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'A.ts', icon: '📄' })];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.tab-bar__tab-icon')).not.toBeNull();
    });

    it('should not render an icon span when tab.icon is absent', () => {
      const fixture = TestBed.createComponent(TabBarComponent);
      fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'A.ts' })];
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.tab-bar__tab-icon')).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// TabBarComponent — guarded close tests (T036 / T033)
// ---------------------------------------------------------------------------

describe('TabBarComponent — guarded close', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabBarComponent],
    }).compileComponents();
  });

  // ── non-dirty tab closes immediately ────────────────────────────────────

  it('should emit tabClosed immediately for a non-dirty closable tab', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Clean.ts', dirty: false, closable: true })];
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    flushMicrotasks();

    expect(spy).toHaveBeenCalledWith('t1');
  }));

  // ── dirty tab without a guard closes immediately ─────────────────────────

  it('should emit tabClosed immediately for a dirty tab with no registered guard', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    fixture.componentInstance.closeGuards = {};
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    flushMicrotasks();

    expect(spy).toHaveBeenCalledWith('t1');
  }));

  // ── synchronous guard returns true ──────────────────────────────────────

  it('should emit tabClosed when a synchronous guard returns true', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    const guard: TabCloseGuard = { beforeClose: () => true };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    flushMicrotasks();

    expect(spy).toHaveBeenCalledWith('t1');
  }));

  // ── synchronous guard returns false ─────────────────────────────────────

  it('should NOT emit tabClosed when a synchronous guard returns false', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    const guard: TabCloseGuard = { beforeClose: () => false };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    flushMicrotasks();

    expect(spy).not.toHaveBeenCalled();
  }));

  // ── asynchronous guard resolves true ────────────────────────────────────

  it('should emit tabClosed when an async guard resolves with true', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    const guard: TabCloseGuard = { beforeClose: () => Promise.resolve(true) };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    flushMicrotasks();

    expect(spy).toHaveBeenCalledWith('t1');
  }));

  // ── asynchronous guard resolves false ────────────────────────────────────

  it('should NOT emit tabClosed when an async guard resolves with false', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    const guard: TabCloseGuard = { beforeClose: () => Promise.resolve(false) };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    flushMicrotasks();

    expect(spy).not.toHaveBeenCalled();
  }));

  // ── asynchronous guard that rejects ─────────────────────────────────────

  it('should NOT emit tabClosed when an async guard rejects', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    const guard: TabCloseGuard = { beforeClose: () => Promise.reject(new Error('cancelled')) };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    flushMicrotasks();

    expect(spy).not.toHaveBeenCalled();
  }));

  // ── guard timeout ────────────────────────────────────────────────────────

  it('should emit closeGuardTimeout and NOT emit tabClosed when guard times out', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    // A guard that never resolves
    const guard: TabCloseGuard = { beforeClose: () => new Promise<boolean>(() => { /* never resolves */ }) };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();
    const closedSpy = spyOn(fixture.componentInstance.tabClosed, 'emit');
    const timeoutSpy = spyOn(fixture.componentInstance.closeGuardTimeout, 'emit');

    (fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement).click();
    tick(10_000); // advance past the 10-second guard timeout
    flushMicrotasks();

    expect(timeoutSpy).toHaveBeenCalledWith('t1');
    expect(closedSpy).not.toHaveBeenCalled();
  }));

  // ── duplicate close attempt is ignored while guard is pending ────────────

  it('should ignore a duplicate close click while a guard is already resolving', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    let resolveGuard!: (v: boolean) => void;
    const guard: TabCloseGuard = {
      beforeClose: () => new Promise<boolean>((r) => { resolveGuard = r; }),
    };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');

    const closeBtn = fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLElement;
    closeBtn.click(); // first attempt → guard in-flight
    flushMicrotasks();
    closeBtn.click(); // second attempt → should be ignored

    resolveGuard(true);
    flushMicrotasks();

    // Guard called only once; tabClosed emitted only once.
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('t1');

    // Discard the 10s timeout timer to avoid leaking.
    tick(10_000);
  }));

  // ── close button is disabled while guard is pending ──────────────────────

  it('should disable the close button while a guard is resolving', fakeAsync(() => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 't1', label: 'Dirty.ts', dirty: true, closable: true })];
    let resolveGuard!: (v: boolean) => void;
    const guard: TabCloseGuard = {
      beforeClose: () => new Promise<boolean>((r) => { resolveGuard = r; }),
    };
    fixture.componentInstance.closeGuards = { t1: guard };
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('[data-testid="tab-close-t1"]') as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(closeBtn.disabled).toBeTrue();

    resolveGuard(false);
    flushMicrotasks();
    fixture.detectChanges();

    expect(closeBtn.disabled).toBeFalse();

    tick(10_000);
  }));

  // ── closeGuards input defaults to empty map ──────────────────────────────

  it('should default closeGuards to an empty record', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    expect(fixture.componentInstance.closeGuards).toEqual({});
  });

  // ── closeGuardTimeout output is exposed ─────────────────────────────────

  it('should expose closeGuardTimeout as an EventEmitter', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    expect(fixture.componentInstance.closeGuardTimeout).toBeDefined();
  });
});
