import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutSplittablePanelComponent } from './layout-splittable-panel.component';
import { DockZone } from '../../../core/models/dock-zone-assignment.model';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { NgClass, AsyncPipe } from '@angular/common';

describe('LayoutSplittablePanelComponent', () => {
    let component: LayoutSplittablePanelComponent;
    let fixture: ComponentFixture<LayoutSplittablePanelComponent>;
    let mockStore: any;

    beforeEach(async () => {
        mockStore = {
            select: (selector: any) => of(new Map())
        };

        await TestBed.configureTestingModule({
            imports: [LayoutSplittablePanelComponent, NgClass, AsyncPipe],
            providers: [
                { provide: Store, useValue: mockStore },
                { 
                    provide: 'DragDropService', 
                    useValue: { registerDropZone: () => {} } 
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LayoutSplittablePanelComponent);
        component = fixture.componentInstance;
        
        component.zones = [
            [DockZone.PrimaryTopLeftWorkspace, DockZone.PrimaryTopRightWorkspace],
            [DockZone.PrimaryBottomLeftWorkspace, DockZone.PrimaryBottomRightWorkspace]
        ];
        
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize panel states based on zones matrix', () => {
        expect(component.rows).toBe(2);
        expect(component.columns).toBe(2);
        expect(component.panelStates.length).toBe(2);
        expect(component.panelStates[0].length).toBe(2);
    });

    it('should only have the first panel visible initially', () => {
        expect(component.isPanelVisible(DockZone.PrimaryTopLeftWorkspace)).toBeTrue();
        expect(component.isPanelVisible(DockZone.PrimaryTopRightWorkspace)).toBeFalse();
    });

    it('should enable adjacent panels when onSplitPanels is called with "horizontal"', () => {
        // Mock event
        const event = new MouseEvent('click');
        component.onSplitPanels(event, 'horizontal');
        
        // In horizontal split, it should enable the first disabled column
        // All rows in column 1 should become visible
        expect(component.isPanelVisible(DockZone.PrimaryTopRightWorkspace)).toBeTrue();
        expect(component.isPanelVisible(DockZone.PrimaryBottomRightWorkspace)).toBeTrue();
    });

    it('should enable adjacent panels when onSplitPanels is called with "vertical"', () => {
        const event = new MouseEvent('click');
        component.onSplitPanels(event, 'vertical');
        
        // In vertical split, it should enable the first disabled row
        // All columns in row 1 should become visible
        expect(component.isPanelVisible(DockZone.PrimaryBottomLeftWorkspace)).toBeTrue();
        expect(component.isPanelVisible(DockZone.PrimaryBottomRightWorkspace)).toBeTrue();
    });

    it('should hide a panel and migrate tabs when onVisivilityChange is called', () => {
        // Setup: make multiple panels visible
        component.panelStates[0][0].visible = true;
        component.panelStates[0][1].visible = true;

        const spy = spyOn(component.store, 'dispatch');
        
        component.onVisivilityChange(false, DockZone.PrimaryTopRightWorkspace);
        
        expect(component.isPanelVisible(DockZone.PrimaryTopRightWorkspace)).toBeFalse();
        // Verify that moveTabToZone was dispatched (though tabs are mocked as empty map)
        expect(spy).toHaveBeenCalled();
    });
});
