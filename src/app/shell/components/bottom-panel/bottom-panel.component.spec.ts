import { TestBed } from '@angular/core/testing';
import { BottomPanelComponent } from './bottom-panel.component';
import { PanelTab } from '../../models/panel-tab.model';
import { EventBusService } from '../../../core/services/event-bus.service';

const makePanel = (partial: Partial<PanelTab> & { id: string; label: string }): PanelTab => ({
  closable: true,
  ...partial,
});

describe('BottomPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomPanelComponent],
    }).compileComponents();
  });

  it('should create the bottom-panel component', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render the panel when visible is false', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="bottom-panel"]')).toBeNull();
  });

  it('should render the panel when visible is true', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="bottom-panel"]')).not.toBeNull();
  });

  it('should render the panel header when visible', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="bottom-panel-header"]')).not.toBeNull();
  });

  it('should render panel tabs when visible', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [
      makePanel({ id: 'terminal', label: 'Terminal' }),
      makePanel({ id: 'output', label: 'Output' }),
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="panel-tab-terminal"]')).not.toBeNull();
    expect(compiled.querySelector('[data-testid="panel-tab-output"]')).not.toBeNull();
  });

  it('should apply active class to the active panel tab', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [makePanel({ id: 'terminal', label: 'Terminal' })];
    fixture.componentInstance.activePanelId = 'terminal';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const tab = compiled.querySelector('[data-testid="panel-tab-terminal"]');
    expect(tab?.classList.contains('bottom-panel__tab--active')).toBeTrue();
  });

  it('should emit activePanelChange when a panel tab is clicked', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [makePanel({ id: 'terminal', label: 'Terminal' })];
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.activePanelChange, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="panel-tab-terminal"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith('terminal');
  });

  it('should emit visibilityChange(false) when close button is clicked', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.visibilityChange, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="bottom-panel-close"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should emit visibilityChange(false) when toggle button is clicked while visible', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const spy = spyOn(fixture.componentInstance.visibilityChange, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('[data-testid="bottom-panel-toggle"]') as HTMLElement).click();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should render the content area when visible', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="bottom-panel-content"]')).not.toBeNull();
  });

  it('should default to hidden, height 220, empty panels', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    const component = fixture.componentInstance;
    expect(component.visible).toBeFalse();
    expect(component.height).toBe(220);
    expect(component.panels).toEqual([]);
    expect(component.activePanelId).toBe('');
  });

  it('should apply height style when visible', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.height = 300;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const panel = compiled.querySelector<HTMLElement>('[data-testid="bottom-panel"]');
    expect(panel?.style.height).toBe('300px');
  });

  it('should expose heightChange as an EventEmitter (reserved for resize-handle drag)', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    expect(fixture.componentInstance.heightChange).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // Accessibility regression checks
  // ---------------------------------------------------------------------------

  describe('accessibility', () => {
    it('should have aria-label on the bottom panel container', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const panel = compiled.querySelector('[data-testid="bottom-panel"]');
      expect(panel?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have role="tablist" on the panel tabs container', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const tabsContainer = compiled.querySelector('.bottom-panel__tabs');
      expect(tabsContainer?.getAttribute('role')).toBe('tablist');
    });

    it('should have aria-label on the toggle button', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleBtn = compiled.querySelector('[data-testid="bottom-panel-toggle"]');
      expect(toggleBtn?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-label on the close button', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const closeBtn = compiled.querySelector('[data-testid="bottom-panel-close"]');
      expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have role="tabpanel" on the content area', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const content = compiled.querySelector('[data-testid="bottom-panel-content"]');
      expect(content?.getAttribute('role')).toBe('tabpanel');
    });

    it('should set aria-selected on panel tab buttons', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.componentInstance.panels = [makePanel({ id: 'terminal', label: 'Terminal' })];
      fixture.componentInstance.activePanelId = 'terminal';
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const tabBtn = compiled.querySelector('[data-testid="panel-tab-terminal"]');
      expect(tabBtn?.getAttribute('aria-selected')).toBe('true');
    });
  });

  it('should assign id to each tab button based on panel id', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [makePanel({ id: 'terminal', label: 'Terminal' })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const tabBtn = compiled.querySelector('[data-testid="panel-tab-terminal"]');
    expect(tabBtn?.id).toBe('panel-tab-btn-terminal');
  });

  it('should set aria-controls="bottom-panel-content" on tab buttons', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [makePanel({ id: 'terminal', label: 'Terminal' })];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const tabBtn = compiled.querySelector('[data-testid="panel-tab-terminal"]');
    expect(tabBtn?.getAttribute('aria-controls')).toBe('bottom-panel-content');
  });

  it('should set id="bottom-panel-content" on the content area', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('[data-testid="bottom-panel-content"]');
    expect(content?.id).toBe('bottom-panel-content');
  });

  it('should set aria-labelledby on the tabpanel when activePanelId is set', () => {
    const fixture = TestBed.createComponent(BottomPanelComponent);
    fixture.componentInstance.visible = true;
    fixture.componentInstance.panels = [makePanel({ id: 'terminal', label: 'Terminal' })];
    fixture.componentInstance.activePanelId = 'terminal';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('[data-testid="bottom-panel-content"]');
    expect(content?.getAttribute('aria-labelledby')).toBe('panel-tab-btn-terminal');
  });

  describe('EventBus emissions', () => {
    it('should emit bottomPanel.toggled.v1 with visible:false when toggle is called while visible', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.detectChanges();

      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit');

      fixture.componentInstance.onToggle();

      expect(emitSpy).toHaveBeenCalledWith('bottomPanel.toggled.v1', { visible: false }, 'BottomPanelComponent');
    });

    it('should emit bottomPanel.toggled.v1 with visible:true when toggle is called while hidden', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = false;
      fixture.detectChanges();

      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit');

      fixture.componentInstance.onToggle();

      expect(emitSpy).toHaveBeenCalledWith('bottomPanel.toggled.v1', { visible: true }, 'BottomPanelComponent');
    });

    it('should emit bottomPanel.toggled.v1 with visible:false when close is called', () => {
      const fixture = TestBed.createComponent(BottomPanelComponent);
      fixture.componentInstance.visible = true;
      fixture.detectChanges();

      const eventBus = TestBed.inject(EventBusService);
      const emitSpy = spyOn(eventBus, 'emit');

      fixture.componentInstance.onClose();

      expect(emitSpy).toHaveBeenCalledWith('bottomPanel.toggled.v1', { visible: false }, 'BottomPanelComponent');
    });
  });
});
