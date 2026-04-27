import { TestBed } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { BreadcrumbItem, ToolbarAction } from '../../models/toolbar-action.model';

describe('ToolbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarComponent],
    }).compileComponents();
  });

  it('should create the toolbar component', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the toolbar container', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="toolbar"]')).not.toBeNull();
  });

  it('should render breadcrumb and actions zones', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="toolbar-breadcrumbs"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="toolbar-actions"]')).not.toBeNull();
  });

  it('should render breadcrumb items', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    const component = fixture.componentInstance;
    const crumbs: BreadcrumbItem[] = [
      { label: 'Home' },
      { label: 'Documents' },
    ];
    component.breadcrumbs = crumbs;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Home');
    expect(compiled.textContent).toContain('Documents');
  });

  it('should render action buttons', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    const component = fixture.componentInstance;
    const action: ToolbarAction = {
      id: 'toggle-sidebar',
      icon: '☰',
      label: 'Toggle Sidebar',
      tooltip: 'Toggle sidebar visibility',
      group: 'layout',
    };
    component.actions = [action];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="toolbar-action-toggle-sidebar"]')).not.toBeNull();
  });

  it('should apply disabled class and attribute when action.disabled is true', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    const component = fixture.componentInstance;
    const action: ToolbarAction = {
      id: 'save',
      icon: '💾',
      label: 'Save',
      tooltip: 'Save',
      group: 'primary',
      disabled: true,
    };
    component.actions = [action];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector<HTMLButtonElement>('[data-testid="toolbar-action-save"]');
    expect(btn?.classList.contains('toolbar__action--disabled')).toBeTrue();
    expect(btn?.disabled).toBeTrue();
  });

  it('should apply active class when action.active is true', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    const component = fixture.componentInstance;
    const action: ToolbarAction = {
      id: 'view-toggle',
      icon: '⊞',
      label: 'Toggle view',
      tooltip: 'Toggle view',
      group: 'layout',
      active: true,
    };
    component.actions = [action];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('[data-testid="toolbar-action-view-toggle"]');
    expect(btn?.classList.contains('toolbar__action--active')).toBeTrue();
  });

  it('should not throw when a disabled action is clicked', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    const component = fixture.componentInstance;
    const action: ToolbarAction = {
      id: 'noop',
      icon: '–',
      label: 'Noop',
      tooltip: 'Noop',
      group: 'secondary',
      disabled: true,
    };
    expect(() => component.onActionClick(action)).not.toThrow();
  });

  it('should have role="toolbar" on the container', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const toolbar = compiled.querySelector('[data-testid="toolbar"]');
    expect(toolbar?.getAttribute('role')).toBe('toolbar');
  });

  it('should default to empty breadcrumbs and actions', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    const component = fixture.componentInstance;
    expect(component.breadcrumbs).toEqual([]);
    expect(component.actions).toEqual([]);
  });
});
