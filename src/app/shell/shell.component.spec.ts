import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { ShellComponent } from './shell.component';
import { PlatformAdapter } from '../core/infrastructure/electron/adapters/platform.adapter';
import { EventBusService } from '../core/services/event-bus.service';
import { PlatformName } from '../core/application/ports/platform.port';

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
});
