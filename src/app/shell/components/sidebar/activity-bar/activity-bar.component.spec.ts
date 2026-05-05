import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActivityBarComponent } from './activity-bar.component';
import { SidebarItem } from '../../../models/sidebar-item.model';

// Dummy component for testing
@Component({
  selector: 'app-dummy',
  standalone: true,
  template: '<div>Dummy</div>',
})
class DummyComponent {}

const makeSidebarItem = (
  partial: Partial<SidebarItem> & Pick<SidebarItem, 'id' | 'icon' | 'label' | 'tooltip' | 'position'>
): SidebarItem => ({
  component: DummyComponent,
  ...partial,
});

describe('ActivityBarComponent', () => {
  let component: ActivityBarComponent;
  let fixture: ComponentFixture<ActivityBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the activity bar container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="activity-bar"]')).not.toBeNull();
  });

  it('should render top items', () => {
    const topItem: SidebarItem = {
      id: 'explorer',
      icon: '📁',
      label: 'Explorer',
      tooltip: 'Explorer',
      position: 'top',
      component: DummyComponent,
    };
    component.items = [topItem];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const itemElement = compiled.querySelector('[data-testid="activity-bar-item-explorer"]');
    expect(itemElement).not.toBeNull();
    expect(itemElement?.textContent?.trim()).toContain('📁');
  });

  it('should render bottom items', () => {
    const bottomItem: SidebarItem = {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      tooltip: 'Settings',
      position: 'bottom',
      component: DummyComponent,
    };
    component.items = [bottomItem];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const itemElement = compiled.querySelector('[data-testid="activity-bar-item-settings"]');
    expect(itemElement).not.toBeNull();
  });

  it('should apply active class to active item', () => {
    const item: SidebarItem = {
      id: 'explorer',
      icon: '📁',
      label: 'Explorer',
      tooltip: 'Explorer',
      position: 'top',
      component: DummyComponent,
    };
    component.items = [item];
    component.activeItemId = 'explorer';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const itemElement = compiled.querySelector('[data-testid="activity-bar-item-explorer"]');
    expect(itemElement?.classList.contains('activity-bar__item--active')).toBeTrue();
  });

  it('should emit itemClick when item is clicked', () => {
    const item: SidebarItem = {
      id: 'explorer',
      icon: '📁',
      label: 'Explorer',
      tooltip: 'Explorer',
      position: 'top',
      component: DummyComponent,
    };
    component.items = [item];
    fixture.detectChanges();

    spyOn(component.itemClick, 'emit');

    const compiled = fixture.nativeElement as HTMLElement;
    const itemElement = compiled.querySelector('[data-testid="activity-bar-item-explorer"]') as HTMLElement;
    itemElement.click();

    expect(component.itemClick.emit).toHaveBeenCalledWith(item);
  });

  it('should render badge when present', () => {
    const item: SidebarItem = {
      id: 'notifications',
      icon: '🔔',
      label: 'Notifications',
      tooltip: 'Notifications',
      position: 'top',
      badge: 5,
      component: DummyComponent,
    };
    component.items = [item];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const badgeElement = compiled.querySelector('.activity-bar__item-badge');
    expect(badgeElement).not.toBeNull();
    expect(badgeElement?.textContent?.trim()).toBe('5');
  });

  it('should set aria-pressed on active item', () => {
    const item: SidebarItem = {
      id: 'explorer',
      icon: '📁',
      label: 'Explorer',
      tooltip: 'Explorer',
      position: 'top',
      component: DummyComponent,
    };
    component.items = [item];
    component.activeItemId = 'explorer';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const itemElement = compiled.querySelector('[data-testid="activity-bar-item-explorer"]');
    expect(itemElement?.getAttribute('aria-pressed')).toBe('true');
  });

  // ---------------------------------------------------------------------------
  // Accessibility regression checks
  // ---------------------------------------------------------------------------

  describe('accessibility', () => {
    it('should have role="navigation" on the container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const bar = compiled.querySelector('[data-testid="activity-bar"]');
      expect(bar?.getAttribute('role')).toBe('navigation');
    });

    it('should have aria-label on the container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const bar = compiled.querySelector('[data-testid="activity-bar"]');
      expect(bar?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should set aria-label on items matching the tooltip', () => {
      const item: SidebarItem = makeSidebarItem({
        id: 'explorer',
        icon: '📁',
        label: 'Explorer',
        tooltip: 'Explorer',
        position: 'top',
      });
      component.items = [item];
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const itemElement = compiled.querySelector('[data-testid="activity-bar-item-explorer"]');
      expect(itemElement?.getAttribute('aria-label')).toBe('Explorer');
    });

    it('should set aria-pressed="false" on inactive items', () => {
      const item: SidebarItem = makeSidebarItem({
        id: 'explorer',
        icon: '📁',
        label: 'Explorer',
        tooltip: 'Explorer',
        position: 'top',
      });
      component.items = [item];
      component.activeItemId = 'other';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const itemElement = compiled.querySelector('[data-testid="activity-bar-item-explorer"]');
      expect(itemElement?.getAttribute('aria-pressed')).toBe('false');
    });
  });
});
