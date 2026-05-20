import { TestBed } from '@angular/core/testing';
import { TabAddModalComponent } from './tab-add-modal.component';
import { TabItem } from '../../models/tab-item.model';

const makeTab = (partial: Partial<TabItem> & { id: string; label: string }): TabItem => ({
  dirty: false,
  closable: true,
  pinned: false,
  groupId: 'main',
  ...partial,
});

describe('TabAddModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabAddModalComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the backdrop element', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tab-add-modal__backdrop')).not.toBeNull();
  });

  it('should render the panel element', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tab-add-modal__panel')).not.toBeNull();
  });

  it('should render tab items for each available tab with icon and label', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.componentInstance.availableTabs = [
      makeTab({ id: 'tab-1', label: 'Dashboard', icon: '📊' }),
      makeTab({ id: 'tab-2', label: 'Reports', icon: '📄' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.tab-add-modal__item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Dashboard');
    expect(items[1].textContent).toContain('Reports');
  });

  it('should render tab icon when tab.icon is defined', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.componentInstance.availableTabs = [
      makeTab({ id: 'tab-1', label: 'Dashboard', icon: '📊' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tab-add-modal__item-icon')).not.toBeNull();
  });

  it('should not render icon span when tab.icon is undefined', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.componentInstance.availableTabs = [
      makeTab({ id: 'tab-1', label: 'Dashboard' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tab-add-modal__item-icon')).toBeNull();
  });

  it('should show empty state message when no tabs are available', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.componentInstance.availableTabs = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.tab-add-modal__empty')).not.toBeNull();
    expect(compiled.textContent).toContain('No additional tabs available to open');
  });

  it('should emit tabSelected with the tab id when a tab item is clicked', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.componentInstance.availableTabs = [
      makeTab({ id: 'tab-1', label: 'Dashboard' }),
      makeTab({ id: 'tab-2', label: 'Reports' }),
    ];
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.tabSelected, 'emit');

    const items = fixture.nativeElement.querySelectorAll('.tab-add-modal__item');
    (items[1] as HTMLElement).click();

    expect(spy).toHaveBeenCalledWith('tab-2');
  });

  it('should emit dismissed when backdrop is clicked outside the panel', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.dismissed, 'emit');

    const backdrop = fixture.nativeElement.querySelector('.tab-add-modal__backdrop');
    (backdrop as HTMLElement).click();

    expect(spy).toHaveBeenCalled();
  });

  it('should NOT emit dismissed when clicking inside the panel', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.dismissed, 'emit');

    const panel = fixture.nativeElement.querySelector('.tab-add-modal__panel');
    (panel as HTMLElement).click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit dismissed when Escape key is pressed', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    const spy = spyOn(fixture.componentInstance.dismissed, 'emit');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(spy).toHaveBeenCalled();
  });

  it('should set aria-modal and role=dialog on the backdrop', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const backdrop = compiled.querySelector('.tab-add-modal__backdrop');
    expect(backdrop?.getAttribute('role')).toBe('dialog');
    expect(backdrop?.getAttribute('aria-modal')).toBe('true');
  });

  it('should set role=option on each tab item', () => {
    const fixture = TestBed.createComponent(TabAddModalComponent);
    fixture.componentInstance.availableTabs = [
      makeTab({ id: 'tab-1', label: 'Dashboard' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const option = compiled.querySelector('.tab-add-modal__item');
    expect(option?.getAttribute('role')).toBe('option');
  });
});
