import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { SidebarItem } from '../../models/sidebar-item.model';
import { EventBusService } from '../../../core/services/event-bus.service';

@Component({
  selector: 'app-dummy-sidebar-content',
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

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the sidebar container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="sidebar"]')).not.toBeNull();
  });

  it('should render activity bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="sidebar-activity-bar"]')).not.toBeNull();
  });

  it('should render sidebar panel when not collapsed', () => {
    component.collapsed = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="sidebar-panel"]')).not.toBeNull();
  });

  it('should hide sidebar panel when collapsed', () => {
    component.collapsed = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="sidebar-panel"]')).toBeNull();
  });

  it('should pass items to activity bar', () => {
    const items: SidebarItem[] = [
      makeSidebarItem({
        id: 'explorer',
        icon: '📁',
        label: 'Explorer',
        tooltip: 'Explorer',
        position: 'top',
      }),
    ];
    component.items = items;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const activityBarElement = compiled.querySelector('[data-testid="sidebar-activity-bar"]');
    expect(activityBarElement).not.toBeNull();
  });

  it('should render active sidebar item content in panel', () => {
    component.items = [
      makeSidebarItem({
        id: 'explorer',
        icon: '📁',
        label: 'Explorer',
        tooltip: 'Explorer section',
        position: 'top',
      }),
      makeSidebarItem({
        id: 'search',
        icon: '🔎',
        label: 'Search',
        tooltip: 'Search section',
        position: 'top',
      }),
    ];
    component.activeItemId = 'search';
    component.collapsed = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const section = compiled.querySelector('[data-testid="sidebar-content-search"]');

    expect(section).not.toBeNull();
    expect(section?.textContent).toContain('Search');
  });

  it('should render first item content when active item is missing', () => {
    component.items = [
      makeSidebarItem({
        id: 'explorer',
        icon: '📁',
        label: 'Explorer',
        tooltip: 'Explorer section',
        position: 'top',
      }),
    ];
    component.activeItemId = 'missing';
    component.collapsed = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const section = compiled.querySelector('[data-testid="sidebar-content-explorer"]');

    expect(section).not.toBeNull();
    expect(section?.textContent).toContain('Explorer');
  });

  it('should emit activeItemChange when item is clicked', () => {
    const item: SidebarItem = makeSidebarItem({
      id: 'explorer',
      icon: '📁',
      label: 'Explorer',
      tooltip: 'Explorer',
      position: 'top',
    });

    spyOn(component.activeItemChange, 'emit');
    component.onItemClick(item);

    expect(component.activeItemChange.emit).toHaveBeenCalledWith('explorer');
  });

  it('should have correct ARIA attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebarElement = compiled.querySelector('[data-testid="sidebar"]');
    expect(sidebarElement?.getAttribute('role')).toBe('complementary');
    expect(sidebarElement?.getAttribute('aria-label')).toBe('Sidebar');
  });

  it('should expose aria-expanded="true" when not collapsed', () => {
    component.collapsed = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebarElement = compiled.querySelector('[data-testid="sidebar"]');
    expect(sidebarElement?.getAttribute('aria-expanded')).toBe('true');
  });

  it('should expose aria-expanded="false" when collapsed', () => {
    component.collapsed = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebarElement = compiled.querySelector('[data-testid="sidebar"]');
    expect(sidebarElement?.getAttribute('aria-expanded')).toBe('false');
  });

  it('should have role="region" on the sidebar panel when not collapsed', () => {
    component.collapsed = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = compiled.querySelector('[data-testid="sidebar-panel"]');
    expect(panel?.getAttribute('role')).toBe('region');
  });

  it('should have aria-label on the sidebar panel when not collapsed', () => {
    component.collapsed = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = compiled.querySelector('[data-testid="sidebar-panel"]');
    expect(panel?.getAttribute('aria-label')).toBeTruthy();
  });

  describe('EventBus emissions', () => {
    let eventBus: EventBusService;
    let emitSpy: jasmine.Spy;

    const item: SidebarItem = makeSidebarItem({
      id: 'explorer',
      icon: '📁',
      label: 'Explorer',
      tooltip: 'Explorer',
      position: 'top',
    });

    beforeEach(() => {
      eventBus = TestBed.inject(EventBusService);
      emitSpy = spyOn(eventBus, 'emit');
    });

    it('should emit sidebar.collapsed.v1 with collapsed:true when active item is clicked while panel is open', () => {
      component.items = [item];
      component.activeItemId = 'explorer';
      component.collapsed = false;
      fixture.detectChanges();

      component.onItemClick(item);

      expect(emitSpy).toHaveBeenCalledWith('sidebar.collapsed.v1', { collapsed: true }, 'SidebarComponent');
    });

    it('should emit sidebar.collapsed.v1 with collapsed:false when any item is clicked while sidebar is collapsed', () => {
      const other: SidebarItem = makeSidebarItem({ id: 'git', icon: '🔀', label: 'Git', tooltip: 'Git', position: 'top' });
      component.items = [item, other];
      component.activeItemId = 'explorer';
      component.collapsed = true;
      fixture.detectChanges();

      component.onItemClick(other);

      expect(emitSpy).toHaveBeenCalledWith('sidebar.collapsed.v1', { collapsed: false }, 'SidebarComponent');
    });

    it('should emit sidebar.section.activated.v1 when a new item is activated', () => {
      const other: SidebarItem = makeSidebarItem({ id: 'git', icon: '🔀', label: 'Git', tooltip: 'Git', position: 'top' });
      component.items = [item, other];
      component.activeItemId = 'explorer';
      component.collapsed = false;
      fixture.detectChanges();

      component.onItemClick(other);

      expect(emitSpy).toHaveBeenCalledWith('sidebar.section.activated.v1', { sectionId: 'git' }, 'SidebarComponent');
    });

    it('should emit sidebar.section.activated.v1 when an item is clicked from collapsed state', () => {
      component.items = [item];
      component.activeItemId = null;
      component.collapsed = true;
      fixture.detectChanges();

      component.onItemClick(item);

      expect(emitSpy).toHaveBeenCalledWith('sidebar.section.activated.v1', { sectionId: 'explorer' }, 'SidebarComponent');
    });

    it('should not emit sidebar.section.activated.v1 when active item collapses the sidebar', () => {
      component.items = [item];
      component.activeItemId = 'explorer';
      component.collapsed = false;
      fixture.detectChanges();

      component.onItemClick(item);

      expect(emitSpy).not.toHaveBeenCalledWith('sidebar.section.activated.v1', jasmine.any(Object), jasmine.any(String));
    });
  });
});
