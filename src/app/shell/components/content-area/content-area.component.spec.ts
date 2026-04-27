import { TestBed } from '@angular/core/testing';
import { ContentAreaComponent } from './content-area.component';
import { TabItem } from '../../models/tab-item.model';

describe('ContentAreaComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentAreaComponent],
    }).compileComponents();
  });

  it('should create the content-area component', () => {
    const fixture = TestBed.createComponent(ContentAreaComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the content-area container', () => {
    const fixture = TestBed.createComponent(ContentAreaComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="content-area"]')).not.toBeNull();
  });

  it('should show empty state when activeTab is null', () => {
    const fixture = TestBed.createComponent(ContentAreaComponent);
    fixture.componentInstance.activeTab = null;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="content-area-empty-state"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="content-area-view"]')).toBeNull();
  });

  it('should show view slot when activeTab is set', () => {
    const fixture = TestBed.createComponent(ContentAreaComponent);
    const tab: TabItem = {
      id: 'tab-1',
      label: 'README.md',
      dirty: false,
      closable: true,
      pinned: false,
      groupId: 'main',
    };
    fixture.componentInstance.activeTab = tab;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="content-area-view"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="content-area-empty-state"]')).toBeNull();
  });

  it('should display empty state text when no active tab', () => {
    const fixture = TestBed.createComponent(ContentAreaComponent);
    fixture.componentInstance.activeTab = null;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Selecciona o abre un elemento para comenzar');
  });

  it('should have role="main" on the container', () => {
    const fixture = TestBed.createComponent(ContentAreaComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const area = compiled.querySelector('[data-testid="content-area"]');
    expect(area?.getAttribute('role')).toBe('main');
  });

  it('should default activeTab to null', () => {
    const fixture = TestBed.createComponent(ContentAreaComponent);
    const component = fixture.componentInstance;
    expect(component.activeTab).toBeNull();
  });
});
