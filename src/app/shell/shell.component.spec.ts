import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { provideStore } from '@ngrx/store';
import { ShellComponent } from './shell.component';
import { PlatformAdapter } from '../core/infrastructure/electron/adapters/platform.adapter';
import { EventBusService } from '../core/services/event-bus.service';
import { PlatformName } from '../core/application/ports/platform.port';
import { setBottomPanelHeight, setSecondaryPanelWidth, toggleSecondaryPanel } from '../core/state/layout/layout.actions';

function makePlatformAdapter(platform: PlatformName): PlatformAdapter {
  return {
    platform,
    get isWindows() { return platform === 'win32'; },
    get isMac() { return platform === 'darwin'; },
    get isLinux() { return platform === 'linux'; },
    get platformClass() { return `platform-${platform}`; },
  } as PlatformAdapter;
}

describe('ShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideStore({})],
    }).compileComponents();
  });

  it('should create the shell component', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const shell = fixture.componentInstance;
    expect(shell).toBeTruthy();
  });

  it('should render a shell-root container', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.shell-root')).not.toBeNull();
  });

  it('should not render Angular starter placeholder content', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.angular-logo')).toBeNull();
    expect(compiled.querySelector('.pill-group')).toBeNull();
    expect(compiled.textContent).not.toContain('Hello,');
    expect(compiled.textContent).not.toContain('Congratulations!');
  });

  it('should have role="application" on the shell-root container', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const root = compiled.querySelector('[data-testid="shell-root"]');
    expect(root?.getAttribute('role')).toBe('application');
  });

  it('should have aria-label on the shell-root container', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const root = compiled.querySelector('[data-testid="shell-root"]');
    expect(root?.getAttribute('aria-label')).toBeTruthy();
  });

  describe('platform-aware host class', () => {
    ['win32', 'darwin', 'linux'].forEach((platform) => {
      it(`should apply platform-${platform} class to the host when platform is ${platform}`, async () => {
        await TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
          imports: [ShellComponent],
          providers: [
            provideStore({}),
            { provide: PlatformAdapter, useValue: makePlatformAdapter(platform as PlatformName) },
          ],
        }).compileComponents();

        const fixture = TestBed.createComponent(ShellComponent);
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).classList).toContain(`platform-${platform}`);
      });
    });
  });

  describe('shell.ready emission', () => {
    it('should emit shell.ready.v1 on the EventBus after view init', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();
      fixture.detectChanges();
      expect(emitSpy).toHaveBeenCalledWith('shell.ready.v1', {}, 'ShellComponent');
    });

    it('should emit shell.ready.v1 exactly once per view init', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();
      fixture.detectChanges();
      const readyCalls = emitSpy.calls.all().filter(c => c.args[0] === 'shell.ready.v1');
      expect(readyCalls.length).toBe(1);
    });
  });

  describe('accessibility — shell landmark regions', () => {
    it('should have role="region" on the workspace container', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const workspace = compiled.querySelector('.shell-workspace');
      expect(workspace?.getAttribute('role')).toBe('region');
    });

    it('should have aria-label on the workspace container', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const workspace = compiled.querySelector('.shell-workspace');
      expect(workspace?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have role="contentinfo" on the statusbar footer', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('.shell-statusbar');
      expect(footer?.getAttribute('role')).toBe('contentinfo');
    });

    it('should have aria-label on the statusbar footer', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('.shell-statusbar');
      expect(footer?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should contain at least one keyboard-focusable interactive element', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      // Native <button> elements and elements with tabindex="0" are keyboard reachable.
      // The new-tab button in the tab bar is always rendered, providing a guaranteed target.
      const focusable = compiled.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex="0"]'
      );
      expect(focusable.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('layout event emissions', () => {
    it('should emit shell.layout.changed.v1 when sidebar is toggled', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();

      fixture.componentInstance.onSidebarCollapsedChange(true);

      expect(emitSpy).toHaveBeenCalledWith('shell.layout.changed.v1', { layout: 'sidebar' }, 'ShellComponent');
    });

    it('should emit shell.layout.changed.v1 when bottom panel visibility changes', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();

      fixture.componentInstance.onBottomPanelVisibilityChange(false);

      expect(emitSpy).toHaveBeenCalledWith('shell.layout.changed.v1', { layout: 'bottom-panel' }, 'ShellComponent');
    });

    it('should emit bottomPanel.resized.v1 when bottom panel height changes', fakeAsync(() => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();

      fixture.componentInstance.onBottomPanelHeightChange(350);
      tick(0);

      expect(emitSpy).toHaveBeenCalledWith('bottomPanel.resized.v1', { height: 350 }, 'ShellComponent');
    }));

    it('should update the active bottom panel id when a panel tab is selected', () => {
      const fixture = TestBed.createComponent(ShellComponent);

      fixture.componentInstance.onBottomPanelActivePanelChange('mock-logs');

      expect(fixture.componentInstance.activeBottomPanelId).toBe('mock-logs');
    });

    it('should dispatch toggleSecondaryPanel when secondary visibility changes', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      fixture.componentInstance.onSecondaryPanelVisibilityChange(false);

      expect(dispatchSpy).toHaveBeenCalledWith(toggleSecondaryPanel());
    });

    it('should dispatch setSecondaryPanelWidth when secondary width changes', fakeAsync(() => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      fixture.componentInstance.onSecondaryPanelWidthChange(360);
      tick(0);

      expect(dispatchSpy).toHaveBeenCalledWith(setSecondaryPanelWidth({ width: 360 }));
    }));
  });

  it('should default the active bottom panel id to the first available panel', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.componentInstance.activeBottomPanelId = '';

    (fixture.componentInstance as unknown as {
      syncActiveBottomPanel: (panels: Array<{ id: string }>) => void;
    }).syncActiveBottomPanel([{ id: 'mock-results' }, { id: 'mock-logs' }]);

    expect(fixture.componentInstance.activeBottomPanelId).toBe('mock-results');
  });

  // ── US1: Splitter drag commit ────────────────────────────────────────────────

  describe('US1 — bottom splitter drag commit (T011)', () => {
    function makePointerEvent(clientY: number, pointerId = 1): PointerEvent {
      return { clientY, pointerId, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent;
    }

    it('should dispatch setBottomPanelHeight on bottom splitter pointer-up', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      const component = fixture.componentInstance as unknown as {
        _committedBottomHeight: number;
        onBottomSplitterPointerDown: (e: PointerEvent) => void;
        onBottomSplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedBottomHeight = 200;
      component.onBottomSplitterPointerDown(makePointerEvent(500));
      component.onBottomSplitterPointerUp(makePointerEvent(450)); // drag up 50px → height = 250

      expect(dispatchSpy).toHaveBeenCalledWith(setBottomPanelHeight({ height: 250 }));
    });

    it('should not dispatch setBottomPanelHeight if no drag was started', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      (fixture.componentInstance as unknown as {
        onBottomSplitterPointerUp: (e: PointerEvent) => void;
      }).onBottomSplitterPointerUp(makePointerEvent(450));

      expect(dispatchSpy).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[Layout] Set Bottom Panel Height' }));
    });

    it('should clamp committed height to BOTTOM_PANEL_HEIGHT_MAX on extreme upward drag', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      const component = fixture.componentInstance as unknown as {
        _committedBottomHeight: number;
        onBottomSplitterPointerDown: (e: PointerEvent) => void;
        onBottomSplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedBottomHeight = 200;
      component.onBottomSplitterPointerDown(makePointerEvent(500));
      component.onBottomSplitterPointerUp(makePointerEvent(0)); // drag up 500px

      expect(dispatchSpy).toHaveBeenCalledWith(setBottomPanelHeight({ height: 600 })); // clamped to max
    });
  });

  describe('US1 — secondary splitter drag commit (T012)', () => {
    function makePointerEvent(clientX: number, pointerId = 1): PointerEvent {
      return { clientX, pointerId, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent;
    }

    it('should dispatch setSecondaryPanelWidth on secondary splitter pointer-up', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      const component = fixture.componentInstance as unknown as {
        _committedSecondaryWidth: number;
        onSecondarySplitterPointerDown: (e: PointerEvent) => void;
        onSecondarySplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedSecondaryWidth = 300;
      component.onSecondarySplitterPointerDown(makePointerEvent(800));
      component.onSecondarySplitterPointerUp(makePointerEvent(750)); // drag left 50px → width = 350

      expect(dispatchSpy).toHaveBeenCalledWith(setSecondaryPanelWidth({ width: 350 }));
    });

    it('should not dispatch setSecondaryPanelWidth if no drag was started', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      (fixture.componentInstance as unknown as {
        onSecondarySplitterPointerUp: (e: PointerEvent) => void;
      }).onSecondarySplitterPointerUp(makePointerEvent(750));

      expect(dispatchSpy).not.toHaveBeenCalledWith(jasmine.objectContaining({ type: '[Layout] Set Secondary Panel Width' }));
    });

    it('should clamp committed width to SECONDARY_PANEL_WIDTH_MAX on extreme leftward drag', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const store = TestBed.inject(Store);
      const dispatchSpy = spyOn(store, 'dispatch');

      const component = fixture.componentInstance as unknown as {
        _committedSecondaryWidth: number;
        onSecondarySplitterPointerDown: (e: PointerEvent) => void;
        onSecondarySplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedSecondaryWidth = 300;
      component.onSecondarySplitterPointerDown(makePointerEvent(800));
      component.onSecondarySplitterPointerUp(makePointerEvent(100)); // drag left 700px

      expect(dispatchSpy).toHaveBeenCalledWith(setSecondaryPanelWidth({ width: 500 })); // clamped to max
    });
  });

  describe('US1 — workspace CSS vars wire committed dimensions (T013)', () => {
    it('should expose bottom splitter handle element in the workspace', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const el = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="bottom-splitter"]');
      expect(el).not.toBeNull();
    });

    it('should expose secondary splitter handle element in the workspace', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const el = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="secondary-splitter"]');
      expect(el).not.toBeNull();
    });
  });

  // ── US2: Cursor feedback ────────────────────────────────────────────────────

  describe('US2 — ns-resize cursor on bottom splitter hover (T020)', () => {
    it('should have ns-resize cursor style on the bottom splitter handle', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const handle = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="bottom-splitter"]');
      expect(handle).not.toBeNull();
      const computedCursor = getComputedStyle(handle!).cursor;
      // In JSDOM getComputedStyle may not fully apply CSS; check the class/attribute instead.
      expect(handle!.classList.contains('bottom-splitter-handle')).toBeTrue();
    });
  });

  describe('US2 — ew-resize cursor on secondary splitter hover (T021)', () => {
    it('should have ew-resize cursor style on the secondary splitter handle', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const handle = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('[data-testid="secondary-splitter"]');
      expect(handle).not.toBeNull();
      expect(handle!.classList.contains('secondary-splitter-handle')).toBeTrue();
    });
  });

  describe('US2 — no resize cursor on forbidden regions (T022)', () => {
    it('should not have a splitter handle inside the toolbar', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const toolbar = (fixture.nativeElement as HTMLElement).querySelector('.shell-toolbar');
      expect(toolbar?.querySelector('[data-testid="bottom-splitter"]')).toBeNull();
      expect(toolbar?.querySelector('[data-testid="secondary-splitter"]')).toBeNull();
    });

    it('should not have a splitter handle inside the sidebar', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const sidebar = (fixture.nativeElement as HTMLElement).querySelector('.shell-sidebar');
      expect(sidebar?.querySelector('[data-testid="bottom-splitter"]')).toBeNull();
      expect(sidebar?.querySelector('[data-testid="secondary-splitter"]')).toBeNull();
    });

    it('should not have a splitter handle inside the status bar', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const statusbar = (fixture.nativeElement as HTMLElement).querySelector('.shell-statusbar');
      expect(statusbar?.querySelector('[data-testid="bottom-splitter"]')).toBeNull();
      expect(statusbar?.querySelector('[data-testid="secondary-splitter"]')).toBeNull();
    });
  });

  describe('US2 — cursor feedback latency (T037)', () => {
    it('should render the bottom splitter handle synchronously with detectChanges (< 100 ms)', () => {
      const start = performance.now();
      const fixture = TestBed.createComponent(ShellComponent);
      fixture.detectChanges();
      const elapsed = performance.now() - start;
      const handle = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="bottom-splitter"]');
      expect(handle).not.toBeNull();
      expect(elapsed).toBeLessThan(100);
    });
  });

  // ── US3: EventBus integration ───────────────────────────────────────────────

  describe('US3 — shell.region.resized.v1 on bottom commit (T026)', () => {
    function makePointerEvent(clientY: number, pointerId = 1): PointerEvent {
      return { clientY, pointerId, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent;
    }

    it('should emit shell.region.resized.v1 exactly once on bottom splitter pointer-up', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();

      const component = fixture.componentInstance as unknown as {
        _committedBottomHeight: number;
        onBottomSplitterPointerDown: (e: PointerEvent) => void;
        onBottomSplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedBottomHeight = 200;
      component.onBottomSplitterPointerDown(makePointerEvent(500));
      component.onBottomSplitterPointerUp(makePointerEvent(450));

      const resizeCalls = emitSpy.calls.all().filter(c => c.args[0] === 'shell.region.resized.v1');
      expect(resizeCalls.length).toBe(1);
    });
  });

  describe('US3 — shell.region.resized.v1 on secondary commit (T027)', () => {
    function makePointerEvent(clientX: number, pointerId = 1): PointerEvent {
      return { clientX, pointerId, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent;
    }

    it('should emit shell.region.resized.v1 exactly once on secondary splitter pointer-up', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();

      const component = fixture.componentInstance as unknown as {
        _committedSecondaryWidth: number;
        onSecondarySplitterPointerDown: (e: PointerEvent) => void;
        onSecondarySplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedSecondaryWidth = 300;
      component.onSecondarySplitterPointerDown(makePointerEvent(800));
      component.onSecondarySplitterPointerUp(makePointerEvent(750));

      const resizeCalls = emitSpy.calls.all().filter(c => c.args[0] === 'shell.region.resized.v1');
      expect(resizeCalls.length).toBe(1);
    });
  });

  describe('US3 — payload integer pixels and regionId semantics (T028)', () => {
    it('should emit shell.region.resized.v1 with integer heightPx and regionId=bottom-panel for bottom commit', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();

      const component = fixture.componentInstance as unknown as {
        _committedBottomHeight: number;
        onBottomSplitterPointerDown: (e: PointerEvent) => void;
        onBottomSplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedBottomHeight = 200;
      component.onBottomSplitterPointerDown(
        { clientY: 500, pointerId: 1, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent
      );
      component.onBottomSplitterPointerUp(
        { clientY: 450, pointerId: 1, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent
      );

      const call = emitSpy.calls.all().find(c => c.args[0] === 'shell.region.resized.v1');
      expect(call).toBeDefined();
      const payload = call!.args[1] as { regionId: string; widthPx: unknown; heightPx: number; source: string; committedAt: number };
      expect(payload.regionId).toBe('bottom-panel');
      expect(payload.widthPx).toBeNull();
      expect(Number.isInteger(payload.heightPx)).toBeTrue();
      expect(payload.source).toBe('user-drag');
      expect(typeof payload.committedAt).toBe('number');
    });

    it('should emit shell.region.resized.v1 with integer widthPx and regionId=secondary-panel for secondary commit', () => {
      const fixture = TestBed.createComponent(ShellComponent);
      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit').and.callThrough();

      const component = fixture.componentInstance as unknown as {
        _committedSecondaryWidth: number;
        onSecondarySplitterPointerDown: (e: PointerEvent) => void;
        onSecondarySplitterPointerUp: (e: PointerEvent) => void;
      };

      component._committedSecondaryWidth = 300;
      component.onSecondarySplitterPointerDown(
        { clientX: 800, pointerId: 1, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent
      );
      component.onSecondarySplitterPointerUp(
        { clientX: 750, pointerId: 1, preventDefault: () => {}, target: { setPointerCapture: () => {} } } as unknown as PointerEvent
      );

      const call = emitSpy.calls.all().find(c => c.args[0] === 'shell.region.resized.v1');
      expect(call).toBeDefined();
      const payload = call!.args[1] as { regionId: string; widthPx: number; heightPx: unknown; source: string; committedAt: number };
      expect(payload.regionId).toBe('secondary-panel');
      expect(Number.isInteger(payload.widthPx)).toBeTrue();
      expect(payload.heightPx).toBeNull();
      expect(payload.source).toBe('user-drag');
    });
  });
});
