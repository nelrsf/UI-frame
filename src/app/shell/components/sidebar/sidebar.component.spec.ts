import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { SidebarItem } from '../../models/sidebar-item.model';

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
      {
        id: 'explorer',
        icon: '📁',
        label: 'Explorer',
        tooltip: 'Explorer',
        position: 'top',
      },
    ];
    component.items = items;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const activityBarElement = compiled.querySelector('[data-testid="sidebar-activity-bar"]');
    expect(activityBarElement).not.toBeNull();
  });

  it('should emit activeItemChange when item is clicked', () => {
    const item: SidebarItem = {
      id: 'explorer',
      icon: '📁',
      label: 'Explorer',
      tooltip: 'Explorer',
      position: 'top',
    };

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
});
