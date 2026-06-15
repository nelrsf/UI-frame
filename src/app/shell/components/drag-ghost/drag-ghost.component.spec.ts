import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DragGhostComponent } from './drag-ghost.component';
import { DragDropService } from '../../services/drag-drop.service';
import { DragPhase, DragState } from '../../../core/models/drag-drop.model';
import { DockZone } from '../../../core/models/dock-zone-assignment.model';
import { Type } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { WithDraggable } from '../../models/tab-item.model';
import { ShellTab } from '../../contracts/ShellTab';

class MockComp {}

function makeDragState(overrides: Partial<DragState> = {}): DragState {
  return {
    phase: DragPhase.Dragging,
    draggedTab: {
      id: 'tab-1',
      label: 'File.ts',
      icon: '📄',
    } as ShellTab & WithDraggable,
    pointerX: 100,
    pointerY: 200,
    activeDropZone: null,
    dropCompatible: false,
    pointerId: 1,
    ...overrides,
  };
}

describe('DragGhostComponent', () => {
  function configureWithDragState(state: DragState | null) {
    const mockService = {
      activeDragState$: of(state),
    };

    TestBed.configureTestingModule({
      imports: [DragGhostComponent],
      providers: [
        { provide: DragDropService, useValue: mockService },
      ],
    }).compileComponents();
  }

  it('should create the component', () => {
    configureWithDragState(null);
    const fixture = TestBed.createComponent(DragGhostComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render anything when drag state is null (idle)', () => {
    configureWithDragState(null);
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.drag-ghost')).toBeNull();
  });

  it('should not render anything when draggedTab is null', () => {
    configureWithDragState({ ...makeDragState(), draggedTab: null });
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.drag-ghost')).toBeNull();
  });

  it('should render the drag ghost with tab label when dragging', () => {
    configureWithDragState(makeDragState());
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const ghost = compiled.querySelector('.drag-ghost');
    expect(ghost).not.toBeNull();
    expect(ghost?.textContent).toContain('File.ts');
  });

  it('should render the tab icon when present', () => {
    configureWithDragState(makeDragState());
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.drag-ghost__icon')).not.toBeNull();
    expect(compiled.querySelector('.drag-ghost__icon')?.textContent).toBe('📄');
  });

  it('should not render icon element when tab has no icon', () => {
    configureWithDragState({ ...makeDragState(), draggedTab: { ...makeDragState().draggedTab!, icon: undefined } });
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.drag-ghost__icon')).toBeNull();
  });

  it('should position the ghost at pointerX + 12, pointerY - 8', () => {
    configureWithDragState(makeDragState({ pointerX: 300, pointerY: 400 }));
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const ghost = compiled.querySelector('.drag-ghost') as HTMLElement;
    expect(ghost.style.left).toBe('312px');
    expect(ghost.style.top).toBe('392px');
  });

  it('should show accept indicator when over a compatible drop zone', () => {
    configureWithDragState(makeDragState({
      activeDropZone: DockZone.BottomCenterPanel,
      dropCompatible: true,
    }));
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const acceptIndicator = compiled.querySelector('.drag-ghost__indicator--accept');
    expect(acceptIndicator).not.toBeNull();
    expect(acceptIndicator?.getAttribute('aria-label')).toBe('Compatible drop zone');
  });

  it('should show reject indicator when over an incompatible drop zone', () => {
    configureWithDragState(makeDragState({
      activeDropZone: DockZone.BottomCenterPanel,
      dropCompatible: false,
    }));
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const rejectIndicator = compiled.querySelector('.drag-ghost__indicator--reject');
    expect(rejectIndicator).not.toBeNull();
    expect(rejectIndicator?.getAttribute('aria-label')).toBe('Incompatible drop zone');
  });

  it('should not show any indicator when not over a drop zone', () => {
    configureWithDragState(makeDragState({
      activeDropZone: null,
      dropCompatible: false,
    }));
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.drag-ghost__indicator--accept')).toBeNull();
    expect(compiled.querySelector('.drag-ghost__indicator--reject')).toBeNull();
  });

  it('should apply compatible CSS class when dropCompatible is true', () => {
    configureWithDragState(makeDragState({
      activeDropZone: DockZone.BottomCenterPanel,
      dropCompatible: true,
    }));
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const ghost = compiled.querySelector('.drag-ghost');
    expect(ghost?.classList.contains('drag-ghost--compatible')).toBeTrue();
    expect(ghost?.classList.contains('drag-ghost--incompatible')).toBeFalse();
  });

  it('should apply incompatible CSS class when dropCompatible is false', () => {
    configureWithDragState(makeDragState({
      activeDropZone: DockZone.BottomCenterPanel,
      dropCompatible: false,
    }));
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const ghost = compiled.querySelector('.drag-ghost');
    expect(ghost?.classList.contains('drag-ghost--incompatible')).toBeTrue();
    expect(ghost?.classList.contains('drag-ghost--compatible')).toBeFalse();
  });

  it('should have aria-hidden="true" for accessibility', () => {
    configureWithDragState(makeDragState());
    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const ghost = compiled.querySelector('.drag-ghost');
    expect(ghost?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should update rendering when drag state changes via BehaviorSubject', fakeAsync(() => {
    const stateSubject = new BehaviorSubject<DragState | null>(null);
    const mockService = { activeDragState$: stateSubject.asObservable() };

    TestBed.configureTestingModule({
      imports: [DragGhostComponent],
      providers: [{ provide: DragDropService, useValue: mockService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(DragGhostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.drag-ghost')).toBeNull();

    // Simulate drag start.
    stateSubject.next(makeDragState());
    tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.drag-ghost')).not.toBeNull();

    // Simulate drag end.
    stateSubject.next(null);
    tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.drag-ghost')).toBeNull();
  }));
});
