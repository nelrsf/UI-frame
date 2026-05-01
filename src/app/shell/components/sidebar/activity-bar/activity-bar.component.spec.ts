import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityBarComponent } from './activity-bar.component';
import { SidebarItem } from '../../../models/sidebar-item.model';

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
    };
    component.items = [item];
    component.activeItemId = 'explorer';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const itemElement = compiled.querySelector('[data-testid="activity-bar-item-explorer"]');
    expect(itemElement?.getAttribute('aria-pressed')).toBe('true');
  });
});
