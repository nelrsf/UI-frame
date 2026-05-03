import { TestBed } from '@angular/core/testing';
import { SecondaryPanelComponent } from './secondary-panel.component';
import { PanelTab } from '../../models/panel-tab.model';

const makePanel = (partial: Partial<PanelTab> & { id: string; label: string }): PanelTab => ({
  closable: true,
  ...partial,
});

describe('SecondaryPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondaryPanelComponent],
    }).compileComponents();
  });

  it('should create the secondary-panel component', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render the panel when visible is false', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="secondary-panel"]')).toBeNull();
  });

  it('should render the panel when visible is true', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="secondary-panel"]')).not.toBeNull();
  });

  it('should render the panel header when visible', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="secondary-panel-header"]')).not.toBeNull();
  });

  it('should apply width style when visible', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.width = 350;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = compiled.querySelector('[data-testid="secondary-panel"]') as HTMLElement;
    expect(panel.style.width).toBe('350px');
  });

  it('should render panel tabs when visible and panels are provided', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [
      makePanel({ id: 'outline', label: 'Outline' }),
      makePanel({ id: 'references', label: 'References' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('[data-testid^="secondary-panel-tab-"]').length).toBe(2);
  });

  it('should mark the active panel tab', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [
      makePanel({ id: 'outline', label: 'Outline' }),
    ];
    fixture.componentInstance.activePanelId = 'outline';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const tab = compiled.querySelector('[data-testid="secondary-panel-tab-outline"]');
    expect(tab?.classList).toContain('secondary-panel__tab--active');
  });

  it('should emit visibilityChange(false) when close button is clicked', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const emitted: boolean[] = [];
    fixture.componentInstance.visibilityChange.subscribe((v: boolean) => emitted.push(v));
    const closeBtn = compiled.querySelector('[data-testid="secondary-panel-close"]') as HTMLElement;
    closeBtn.click();
    expect(emitted).toEqual([false]);
  });

  it('should emit visibilityChange(false) when toggle button is clicked and panel is visible', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const emitted: boolean[] = [];
    fixture.componentInstance.visibilityChange.subscribe((v: boolean) => emitted.push(v));
    const toggleBtn = compiled.querySelector('[data-testid="secondary-panel-toggle"]') as HTMLElement;
    toggleBtn.click();
    expect(emitted).toEqual([false]);
  });

  it('should emit activePanelChange when a tab is clicked', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [makePanel({ id: 'outline', label: 'Outline' })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const emitted: string[] = [];
    fixture.componentInstance.activePanelChange.subscribe((id: string) => emitted.push(id));
    const tabBtn = compiled.querySelector('[data-testid="secondary-panel-tab-outline"]') as HTMLElement;
    tabBtn.click();
    expect(emitted).toEqual(['outline']);
  });

  it('should render panel content area when visible', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="secondary-panel-content"]')).not.toBeNull();
  });

  it('should have role="complementary" on the panel container', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = compiled.querySelector('[data-testid="secondary-panel"]');
    expect(panel?.getAttribute('role')).toBe('complementary');
  });

  it('should default visible to false', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    expect(fixture.componentInstance.visible).toBeFalse();
  });

  it('should default width to 300', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    expect(fixture.componentInstance.width).toBe(300);
  });
});
