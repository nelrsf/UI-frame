import { TestBed } from '@angular/core/testing';
import { TopBarComponent } from './top-bar.component';

describe('TopBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarComponent],
    }).compileComponents();
  });

  it('should create the top-bar component', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the top-bar container', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.top-bar')).not.toBeNull();
  });

  it('should expose a brand slot', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="top-bar-brand"]')).not.toBeNull();
  });

  it('should expose a menu slot', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="top-bar-menu"]')).not.toBeNull();
  });

  it('should expose an actions slot', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="top-bar-actions"]')).not.toBeNull();
  });

  it('should expose a window-controls slot', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="top-bar-window-controls"]')).not.toBeNull();
  });

  it('should have role="banner" on the container', () => {
    const fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bar = compiled.querySelector('.top-bar');
    expect(bar?.getAttribute('role')).toBe('banner');
  });
});
