import { TestBed } from '@angular/core/testing';
import { TabBarComponent } from './tab-bar.component';
import { TabItem } from '../../models/tab-item.model';

const makeTab = (partial: Partial<TabItem> & { id: string; label: string }): TabItem => ({
  dirty: false,
  closable: true,
  pinned: false,
  groupId: 'main',
  ...partial,
});

describe('TabBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabBarComponent],
    }).compileComponents();
  });

  it('should create the tab-bar component', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the tab-bar container', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-bar"]')).not.toBeNull();
  });

  it('should render the new-tab button', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-bar-new-tab"]')).not.toBeNull();
  });

  it('should render tabs for each TabItem', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [
      makeTab({ id: 'tab-1', label: 'File.ts' }),
      makeTab({ id: 'tab-2', label: 'README.md' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-tab-1"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="tab-tab-2"]')).not.toBeNull();
  });

  it('should apply active class to the active tab', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts' })];
    fixture.componentInstance.activeTabId = 'tab-1';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const tab = compiled.querySelector('[data-testid="tab-tab-1"]');
    expect(tab?.classList.contains('tab-bar__tab--active')).toBeTrue();
  });

  it('should show dirty indicator when tab.dirty is true', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', dirty: true })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-dirty-indicator"]')).not.toBeNull();
  });

  it('should not show dirty indicator when tab.dirty is false', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', dirty: false })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-dirty-indicator"]')).toBeNull();
  });

  it('should render close button for closable tabs', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', closable: true })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-close-tab-1"]')).not.toBeNull();
  });

  it('should not render close button for non-closable tabs', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', closable: false })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="tab-close-tab-1"]')).toBeNull();
  });

  it('should emit tabSelected when a tab is clicked', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts' })];
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabSelected, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="tab-tab-1"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith('tab-1');
  });

  it('should emit tabClosed when a close button is clicked', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [makeTab({ id: 'tab-1', label: 'File.ts', closable: true })];
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabClosed, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="tab-close-tab-1"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith('tab-1');
  });

  it('should emit newTabRequested when the new-tab button is clicked', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.newTabRequested, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="tab-bar-new-tab"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('should have role="tablist" on the container', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const bar = compiled.querySelector('[data-testid="tab-bar"]');
    expect(bar?.getAttribute('role')).toBe('tablist');
  });

  it('should default to empty tabs, empty activeTabId and empty groupId', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    const component = fixture.componentInstance;
    expect(component.tabs).toEqual([]);
    expect(component.activeTabId).toBe('');
    expect(component.groupId).toBe('');
  });

  it('should expose tabReordered as an EventEmitter (reserved for drag-reorder)', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    expect(fixture.componentInstance.tabReordered).toBeDefined();
  });

  it('should set tabindex="0" on the active tab', () => {
    const fixture = TestBed.createComponent(TabBarComponent);
    fixture.componentInstance.tabs = [
      makeTab({ id: 'tab-1', label: 'File.ts' }),
      makeTab({ id: 'tab-2', label: 'README.md' }),
    ];
    fixture.componentInstance.activeTabId = 'tab-1';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const activeTab = compiled.querySelector('[data-testid="tab-tab-1"]');
    const inactiveTab = compiled.querySelector('[data-testid="tab-tab-2"]');
    expect(activeTab?.getAttribute('tabindex')).toBe('0');
    expect(inactiveTab?.getAttribute('tabindex')).toBe('-1');
  });
});
