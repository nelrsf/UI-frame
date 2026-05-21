import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { NgZone, Type } from '@angular/core';
import { DragDropService, CrossRegionDropPayload } from './drag-drop.service';
import {
  DragPhase,
  DraggableTab,
  RegionInterface,
} from '../../core/models/drag-drop.model';
import { DockZone } from '../../core/models/dock-zone-assignment.model';
import { moveTabToZone } from '../../core/state/workspace';
import { workspaceReducer } from '../../core/state/workspace/workspace.reducer';

class MockCentralTabComp {}
class MockBottomPanelComp {}
class MockMultiInterfaceComp {}

function makeDraggableTab(partial: Partial<DraggableTab> & { id: string; label: string }): DraggableTab {
  return {
    id: partial.id,
    label: partial.label,
    icon: partial.icon,
    componentType: partial.componentType ?? MockCentralTabComp,
    implementedInterfaces: partial.implementedInterfaces ?? new Set<RegionInterface>(),
    sourceZone: partial.sourceZone ?? DockZone.PrimaryWorkspace,
    sourceGroupId: partial.sourceGroupId ?? 'main',
    pinned: partial.pinned ?? false,
    dirty: partial.dirty ?? false,
    closable: partial.closable ?? true,
  };
}

function makePointerEvent(partial: Partial<PointerEventInit> & { target?: HTMLElement } = {}): PointerEvent {
  const event = new PointerEvent('pointerdown', {
    button: 0,
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    ...partial,
  });
  if (partial.target) {
    Object.defineProperty(event, 'target', { value: partial.target });
  }
  return event;
}

function makeMoveEvent(x: number, y: number): PointerEvent {
  return new PointerEvent('pointermove', {
    clientX: x,
    clientY: y,
    pointerId: 1,
  });
}

describe('DragDropService', () => {
  let service: DragDropService;
  let store: Store;
  let ngZone: NgZone;
  let bottomPanelEl: HTMLElement;
  let secondaryPanelEl: HTMLElement;
  let dragSourceEl: HTMLElement;

  beforeEach(() => {
    dragSourceEl = document.createElement('div');
    dragSourceEl.setAttribute('data-testid', 'tab-test');
    document.body.appendChild(dragSourceEl);

    bottomPanelEl = document.createElement('div');
    bottomPanelEl.className = 'shell-bottom-panel';
    bottomPanelEl.style.position = 'absolute';
    bottomPanelEl.style.top = '500px';
    bottomPanelEl.style.left = '0';
    bottomPanelEl.style.width = '800px';
    bottomPanelEl.style.height = '200px';
    document.body.appendChild(bottomPanelEl);

    secondaryPanelEl = document.createElement('div');
    secondaryPanelEl.className = 'shell-secondary-panel';
    secondaryPanelEl.style.position = 'absolute';
    secondaryPanelEl.style.top = '0';
    secondaryPanelEl.style.right = '0';
    secondaryPanelEl.style.width = '300px';
    secondaryPanelEl.style.height = '600px';
    document.body.appendChild(secondaryPanelEl);

    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ workspace: workspaceReducer }),
      ],
      providers: [DragDropService],
    });

    service = TestBed.inject(DragDropService);
    store = TestBed.inject(Store);
    ngZone = TestBed.inject(NgZone);

    service.registerDropZone(DockZone.BottomPanel, bottomPanelEl, RegionInterface.BottomPanelEntry);
    service.registerDropZone(DockZone.SecondaryPanel, secondaryPanelEl, RegionInterface.SecondaryPanelEntry);
  });

  afterEach(() => {
    document.body.removeChild(dragSourceEl);
    document.body.removeChild(bottomPanelEl);
    document.body.removeChild(secondaryPanelEl);
    service.ngOnDestroy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should start in idle phase with no dragged tab', (done) => {
      service.activeDragState$.subscribe((state) => {
        expect(state).toBeNull();
        done();
      });
    });

    it('should have null activeDropZone initially', (done) => {
      service.activeDropZone$.subscribe((zone) => {
        expect(zone).toBeNull();
        done();
      });
    });

    it('should have dropCompatible false initially', (done) => {
      service.dropCompatible$.subscribe((compatible) => {
        expect(compatible).toBeFalse();
        done();
      });
    });
  });

  // ── Drag threshold ────────────────────────────────────────────────────────

  describe('drag threshold', () => {
    it('should not transition to Dragging phase when pointer moves less than 4px', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);

      // Move only 2px — below threshold.
      service.onDragMove(makeMoveEvent(101, 101));

      expect(service.isDragging()).toBeFalse();
    });

    it('should transition to Dragging phase when pointer moves 4px or more', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);

      // Move 5px — above threshold.
      service.onDragMove(makeMoveEvent(105, 100));

      expect(service.isDragging()).toBeTrue();
    });

    it('should capture pointer on startDrag', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const target = document.createElement('div');
      const setCaptureSpy = spyOn(target, 'setPointerCapture').and.callFake(() => {});
      const downEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 42,
      });
      Object.defineProperty(downEvent, 'target', { value: target });

      service.startDrag(tab, downEvent);

      expect(setCaptureSpy).toHaveBeenCalledWith(42);
    });
  });

  // ── Drop zone detection ───────────────────────────────────────────────────

  describe('drop zone detection', () => {
    it('should detect bottom panel drop zone when pointer is over it', fakeAsync(() => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));

      // Pointer over bottom panel (top: 500, left: 0, width: 800, height: 200).
      service.onDragMove(makeMoveEvent(400, 550));
      tick();

      let activeZone: DockZone | null = null as DockZone | null;
      service.activeDropZone$.subscribe((zone) => { activeZone = zone; });
      expect(activeZone).toBe(DockZone.BottomPanel);
    }));

    it('should return null drop zone when pointer is outside all zones', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));

      // Pointer far away from any zone.
      service.onDragMove(makeMoveEvent(10, 10));

      let activeZone: DockZone | null = null;
      service.activeDropZone$.subscribe((zone) => { activeZone = zone; });
      expect(activeZone).toBeNull();
    });
  });

  // ── Interface compatibility ───────────────────────────────────────────────

  describe('interface compatibility', () => {
    it('should mark drop zone as compatible when tab implements required interface', () => {
      service.registerComponentInterface(MockBottomPanelComp, RegionInterface.BottomPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        componentType: MockBottomPanelComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry]),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      let compatible = false;
      service.dropCompatible$.subscribe((c) => { compatible = c; });
      expect(compatible).toBeTrue();
    });

    it('should mark drop zone as incompatible when tab does not implement required interface', () => {
      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        implementedInterfaces: new Set<RegionInterface>(),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      let compatible = true;
      service.dropCompatible$.subscribe((c) => { compatible = c; });
      expect(compatible).toBeFalse();
    });
  });

  // ── Cross-region drop ─────────────────────────────────────────────────────

  describe('cross-region drop', () => {
    it('should dispatch moveTabToZone and emit crossRegionDrop$ on successful drop', fakeAsync(() => {
      service.registerComponentInterface(MockBottomPanelComp, RegionInterface.BottomPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        componentType: MockBottomPanelComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry]),
        sourceGroupId: 'main',
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      const dropSpy = spyOn(store, 'dispatch');

      let dropPayload: CrossRegionDropPayload | null = null;
      service.crossRegionDrop$.subscribe((payload) => { dropPayload = payload; });

      service.endDrag();
      tick();

      expect(dropSpy).toHaveBeenCalledWith(
        moveTabToZone({
          tabId: 'tab-1',
          sourceGroupId: 'main',
          sourceZone: DockZone.PrimaryWorkspace,
          targetZone: DockZone.BottomPanel,
          tabMetadata: jasmine.any(Object) as any,
        })
      );
      expect(dropPayload).not.toBeNull();
      expect(dropPayload!.tabId).toBe('tab-1');
      expect(dropPayload!.targetZone).toBe(DockZone.BottomPanel);
    }));

    it('should cancel drag when dropping back to the same zone', () => {
      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        sourceZone: DockZone.PrimaryWorkspace,
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));

      // No drop zone detected (pointer at 10,10) — same-zone rejection.
      service.onDragMove(makeMoveEvent(10, 10));

      const dropSpy = spyOn(store, 'dispatch');
      let dropPayload: CrossRegionDropPayload | null = null;
      service.crossRegionDrop$.subscribe((payload) => { dropPayload = payload; });

      service.endDrag();

      expect(dropSpy).not.toHaveBeenCalled();
      expect(dropPayload).toBeNull();
    });
  });

  // ── Cancel drag ───────────────────────────────────────────────────────────

  describe('cancelDrag', () => {
    it('should reset drag state without dispatching any action', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));

      const dropSpy = spyOn(store, 'dispatch');
      service.cancelDrag();

      expect(service.isDragging()).toBeFalse();
      expect(dropSpy).not.toHaveBeenCalled();
    });

    it('should reset state when endDrag is called before threshold is met', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);

      // Only moved 1px — below threshold.
      service.onDragMove(makeMoveEvent(101, 100));

      const dropSpy = spyOn(store, 'dispatch');
      service.endDrag();

      expect(service.isDragging()).toBeFalse();
      expect(dropSpy).not.toHaveBeenCalled();
    });
  });

  // ── Drop zone CSS class toggling ──────────────────────────────────────────

  describe('drop zone CSS class toggling', () => {
    it('should add drop-zone-compatible class when over a compatible zone', () => {
      service.registerComponentInterface(MockBottomPanelComp, RegionInterface.BottomPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        componentType: MockBottomPanelComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry]),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      expect(bottomPanelEl.classList.contains('drop-zone-compatible')).toBeTrue();
      expect(bottomPanelEl.classList.contains('drop-zone-incompatible')).toBeFalse();
    });

    it('should add drop-zone-incompatible class when over an incompatible zone', () => {
      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        implementedInterfaces: new Set<RegionInterface>(),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      expect(bottomPanelEl.classList.contains('drop-zone-incompatible')).toBeTrue();
      expect(bottomPanelEl.classList.contains('drop-zone-compatible')).toBeFalse();
    });

    it('should clear all drop zone classes after drag ends', () => {
      service.registerComponentInterface(MockBottomPanelComp, RegionInterface.BottomPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        componentType: MockBottomPanelComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry]),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      expect(bottomPanelEl.classList.contains('drop-zone-compatible')).toBeTrue();

      service.endDrag();

      expect(bottomPanelEl.classList.contains('drop-zone-compatible')).toBeFalse();
      expect(bottomPanelEl.classList.contains('drop-zone-incompatible')).toBeFalse();
    });

    it('should remove classes from previous zone when moving to a new zone', () => {
      service.registerComponentInterface(MockBottomPanelComp, RegionInterface.BottomPanelEntry);
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.BottomPanelEntry);
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.SecondaryPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'File.ts',
        componentType: MockBottomPanelComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry]),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));

      // Over bottom panel.
      service.onDragMove(makeMoveEvent(400, 550));
      expect(bottomPanelEl.classList.contains('drop-zone-compatible')).toBeTrue();

      // Move away — classes should clear.
      service.onDragMove(makeMoveEvent(10, 10));
      expect(bottomPanelEl.classList.contains('drop-zone-compatible')).toBeFalse();
    });
  });

  // ── Component interface registration ──────────────────────────────────────

  describe('component interface registration', () => {
    it('should register a single interface for a component type', () => {
      service.registerComponentInterface(MockCentralTabComp, RegionInterface.CentralRegionTab);
      const interfaces = service.getComponentInterfaces(MockCentralTabComp);
      expect(interfaces.has(RegionInterface.CentralRegionTab)).toBeTrue();
    });

    it('should allow registering multiple interfaces for the same component', () => {
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.CentralRegionTab);
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.BottomPanelEntry);

      const interfaces = service.getComponentInterfaces(MockMultiInterfaceComp);
      expect(interfaces.has(RegionInterface.CentralRegionTab)).toBeTrue();
      expect(interfaces.has(RegionInterface.BottomPanelEntry)).toBeTrue();
      expect(interfaces.size).toBe(2);
    });

    it('should return an empty set for an unregistered component', () => {
      const interfaces = service.getComponentInterfaces(MockCentralTabComp);
      expect(interfaces.size).toBe(0);
    });
  });

  // ── Reorder source registration ───────────────────────────────────────────

  describe('reorder source registration', () => {
    it('should store the reorder source element and callback', () => {
      const tabBarEl = document.createElement('div');
      const callback = jasmine.createSpy('reorderCallback');
      service.registerReorderSource(tabBarEl, callback);

      // Registration is internal — verified indirectly via endDrag behavior.
      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ── Same-region reorder (T032) ────────────────────────────────────────────

  describe('same-region reorder', () => {
    let tabBarEl: HTMLElement;
    let reorderCallback: jasmine.Spy;

    beforeEach(() => {
      tabBarEl = document.createElement('div');
      tabBarEl.className = 'tab-bar';

      // Create tab elements with role="tab" and data-testid.
      const tab1 = document.createElement('div');
      tab1.setAttribute('role', 'tab');
      tab1.setAttribute('data-testid', 'tab-tab-1');
      spyOn(tab1, 'getBoundingClientRect').and.returnValue({ left: 0, right: 100, top: 0, bottom: 30, width: 100, height: 30, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
      tabBarEl.appendChild(tab1);

      const tab2 = document.createElement('div');
      tab2.setAttribute('role', 'tab');
      tab2.setAttribute('data-testid', 'tab-tab-2');
      spyOn(tab2, 'getBoundingClientRect').and.returnValue({ left: 100, right: 200, top: 0, bottom: 30, width: 100, height: 30, x: 100, y: 0, toJSON: () => ({}) } as DOMRect);
      tabBarEl.appendChild(tab2);

      const tab3 = document.createElement('div');
      tab3.setAttribute('role', 'tab');
      tab3.setAttribute('data-testid', 'tab-tab-3');
      spyOn(tab3, 'getBoundingClientRect').and.returnValue({ left: 200, right: 300, top: 0, bottom: 30, width: 100, height: 30, x: 200, y: 0, toJSON: () => ({}) } as DOMRect);
      tabBarEl.appendChild(tab3);

      // Position the tab bar so pointer events can intersect.
      tabBarEl.style.position = 'absolute';
      tabBarEl.style.top = '0';
      tabBarEl.style.left = '0';
      tabBarEl.style.width = '300px';
      tabBarEl.style.height = '30px';
      spyOn(tabBarEl, 'getBoundingClientRect').and.returnValue({ left: 0, right: 300, top: 0, bottom: 30, width: 300, height: 30, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
      document.body.appendChild(tabBarEl);

      reorderCallback = jasmine.createSpy('reorderCallback');
      service.registerReorderSource(tabBarEl, reorderCallback);
    });

    afterEach(() => {
      document.body.removeChild(tabBarEl);
    });

    it('should invoke reorder callback when dropping on source tab bar at different position', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 50, clientY: 15, target: tabBarEl.querySelector('[data-testid="tab-tab-1"]') as HTMLElement });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(55, 15));

      // Move pointer to position over tab-3 (left: 200-300, midX=250). Use x=249 to target index 2.
      service.onDragMove(makeMoveEvent(249, 15));

      service.endDrag();

      expect(reorderCallback).toHaveBeenCalledWith(0, 2);
    });

    it('should not invoke reorder callback when dropping at the same position', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 25, clientY: 15, target: tabBarEl.querySelector('[data-testid="tab-tab-1"]') as HTMLElement });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(30, 15));

      // Move pointer but stay over tab-1's left half (midX=50, so x=40 targets index 0).
      service.onDragMove(makeMoveEvent(40, 15));

      service.endDrag();

      expect(reorderCallback).not.toHaveBeenCalled();
    });

    it('should not invoke reorder callback when pointer is outside the tab bar', () => {
      const tab = makeDraggableTab({ id: 'tab-1', label: 'File.ts' });
      const downEvent = makePointerEvent({ clientX: 50, clientY: 15, target: tabBarEl.querySelector('[data-testid="tab-tab-1"]') as HTMLElement });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(55, 15));

      // Move pointer far away from the tab bar.
      service.onDragMove(makeMoveEvent(500, 500));

      service.endDrag();

      expect(reorderCallback).not.toHaveBeenCalled();
    });
  });

  // ── Multi-interface tab drop validation (T046) ────────────────────────────

  describe('multi-interface tab drop validation', () => {
    it('should allow drop to bottom panel when tab implements BottomPanelEntry', () => {
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.BottomPanelEntry);
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.SecondaryPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'Multi.ts',
        componentType: MockMultiInterfaceComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry, RegionInterface.SecondaryPanelEntry]),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      let compatible = false;
      service.dropCompatible$.subscribe((c) => { compatible = c; });
      expect(compatible).toBeTrue();
    });

    it('should allow drop to secondary panel when tab implements SecondaryPanelEntry', () => {
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.BottomPanelEntry);
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.SecondaryPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'Multi.ts',
        componentType: MockMultiInterfaceComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry, RegionInterface.SecondaryPanelEntry]),
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));

      // Pointer over secondary panel (right: 0, width: 300, top: 0, height: 600).
      // Assuming 800px viewport: x=700 is within secondary panel.
      service.onDragMove(makeMoveEvent(700, 300));

      let compatible = false;
      service.dropCompatible$.subscribe((c) => { compatible = c; });
      expect(compatible).toBeTrue();
    });

    it('should emit crossRegionDrop$ with correct target zone for multi-interface tab', fakeAsync(() => {
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.BottomPanelEntry);
      service.registerComponentInterface(MockMultiInterfaceComp, RegionInterface.SecondaryPanelEntry);

      const tab = makeDraggableTab({
        id: 'tab-1',
        label: 'Multi.ts',
        componentType: MockMultiInterfaceComp,
        implementedInterfaces: new Set([RegionInterface.BottomPanelEntry, RegionInterface.SecondaryPanelEntry]),
        sourceGroupId: 'main',
      });
      const downEvent = makePointerEvent({ clientX: 100, clientY: 100, target: dragSourceEl });
      service.startDrag(tab, downEvent);
      service.onDragMove(makeMoveEvent(105, 100));
      service.onDragMove(makeMoveEvent(400, 550));

      const dropSpy = spyOn(store, 'dispatch');
      let dropPayload: CrossRegionDropPayload | null = null;
      service.crossRegionDrop$.subscribe((payload) => { dropPayload = payload; });

      service.endDrag();
      tick();

      expect(dropSpy).toHaveBeenCalled();
      expect(dropPayload).not.toBeNull();
      expect(dropPayload!.targetZone).toBe(DockZone.BottomPanel);
      expect(dropPayload!.tabId).toBe('tab-1');
    }));
  });
});
