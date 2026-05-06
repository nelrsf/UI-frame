import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SecondaryPanelComponent } from './secondary-panel.component';
import { SecondaryPanelEntry } from '../../models/secondary-panel-entry.model';

@Component({
  standalone: true,
  template: '<div data-testid="dummy-view">Dummy view</div>',
})
class DummyViewComponent {}

const makeEntry = (partial: Partial<SecondaryPanelEntry> & { id: string; label: string }): SecondaryPanelEntry => ({
  component: partial.component ?? DummyViewComponent,
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

  it('should render entries and mark active entry', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.entries = [
      makeEntry({ id: 'secondary-weather', label: 'Weather' }),
      makeEntry({ id: 'secondary-market', label: 'Market' }),
    ];
    fixture.componentInstance.activeEntryId = 'secondary-weather';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('[data-testid^="secondary-panel-tab-"]').length).toBe(2);
    expect(compiled.querySelector('[data-testid="secondary-panel-tab-secondary-weather"]')?.classList)
      .toContain('secondary-panel__tab--active');
  });

  it('should emit activeEntryChange when an entry tab is clicked', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.entries = [makeEntry({ id: 'secondary-weather', label: 'Weather' })];
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.activeEntryChange.subscribe((id) => emitted.push(id));

    (fixture.nativeElement as HTMLElement)
      .querySelector('[data-testid="secondary-panel-tab-secondary-weather"]')
      ?.dispatchEvent(new MouseEvent('click'));

    expect(emitted).toEqual(['secondary-weather']);
  });

  it('should render active component with ngComponentOutlet when activeComponentType is provided', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.activeComponentType = DummyViewComponent;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="dummy-view"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="secondary-panel-empty-state"]')).toBeNull();
  });

  it('should render controlled empty state when activeComponentType is null', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.activeComponentType = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="secondary-panel-empty-state"]')).not.toBeNull();
  });

  it('should emit visibilityChange on toggle method and close button', () => {
    const fixture = TestBed.createComponent(SecondaryPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();

    const emitted: boolean[] = [];
    fixture.componentInstance.visibilityChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.onToggle();
    (fixture.nativeElement as HTMLElement)
      .querySelector('[data-testid="secondary-panel-close"]')
      ?.dispatchEvent(new MouseEvent('click'));

    expect(emitted).toEqual([false, false]);
  });
});
