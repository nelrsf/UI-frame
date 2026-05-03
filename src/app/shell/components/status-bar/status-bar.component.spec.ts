import { TestBed } from '@angular/core/testing';
import { StatusBarComponent } from './status-bar.component';
import { StatusBarItem } from '../../models/status-bar-item.model';

describe('StatusBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBarComponent],
    }).compileComponents();
  });

  it('should create the status-bar component', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the status-bar container', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.status-bar')).not.toBeNull();
  });

  it('should render left and right item zones', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="status-bar-left"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="status-bar-right"]')).not.toBeNull();
  });

  it('should render left items in the left zone', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'branch', label: 'main', clickable: false };
    component.leftItems = [item];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const leftZone = compiled.querySelector('[data-testid="status-bar-left"]');
    expect(leftZone?.querySelector('[data-testid="status-bar-item-branch"]')).not.toBeNull();
    expect(leftZone?.textContent).toContain('main');
  });

  it('should render right items in the right zone', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'ln', label: 'Ln 1, Col 1', clickable: false };
    component.rightItems = [item];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const rightZone = compiled.querySelector('[data-testid="status-bar-right"]');
    expect(rightZone?.querySelector('[data-testid="status-bar-item-ln"]')).not.toBeNull();
    expect(rightZone?.textContent).toContain('Ln 1, Col 1');
  });

  it('should apply warning color class for warning items', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'warn', label: '1 warning', clickable: false, color: 'warning' };
    component.leftItems = [item];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const el = compiled.querySelector('[data-testid="status-bar-item-warn"]');
    expect(el?.classList.contains('status-bar__item--warning')).toBeTrue();
  });

  it('should apply error color class for error items', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'err', label: '2 errors', clickable: false, color: 'error' };
    component.leftItems = [item];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const el = compiled.querySelector('[data-testid="status-bar-item-err"]');
    expect(el?.classList.contains('status-bar__item--error')).toBeTrue();
  });

  it('should apply success color class for success items', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'ok', label: 'OK', clickable: false, color: 'success' };
    component.leftItems = [item];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const el = compiled.querySelector('[data-testid="status-bar-item-ok"]');
    expect(el?.classList.contains('status-bar__item--success')).toBeTrue();
  });

  it('should apply clickable class when item.clickable is true', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'clk', label: 'Click me', clickable: true };
    component.leftItems = [item];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const el = compiled.querySelector('[data-testid="status-bar-item-clk"]');
    expect(el?.classList.contains('status-bar__item--clickable')).toBeTrue();
  });

  it('should not throw when a clickable item without commandId is clicked', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'safe', label: 'Safe click', clickable: true };
    component.leftItems = [item];
    fixture.detectChanges();
    expect(() => component.onItemClick(item)).not.toThrow();
  });

  it('should return early (no-op) when a non-clickable item is clicked', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    const item: StatusBarItem = { id: 'noclk', label: 'No click', clickable: false };
    component.leftItems = [item];
    fixture.detectChanges();
    // Calling onItemClick with clickable=false must not throw and must return without effect.
    expect(() => component.onItemClick(item)).not.toThrow();
  });

  it('should have role="contentinfo" on the container', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bar = compiled.querySelector('.status-bar');
    expect(bar?.getAttribute('role')).toBe('contentinfo');
  });

  it('should default to empty leftItems and rightItems', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    const component = fixture.componentInstance;
    expect(component.leftItems).toEqual([]);
    expect(component.rightItems).toEqual([]);
  });

  it('should have aria-live="polite" on the container', () => {
    const fixture = TestBed.createComponent(StatusBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bar = compiled.querySelector('.status-bar');
    expect(bar?.getAttribute('aria-live')).toBe('polite');
  });
});
