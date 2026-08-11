import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    ViewChildren,
    inject
} from '@angular/core';

import { AsyncPipe, NgClass } from '@angular/common';
import { forkJoin, map, Observable, take } from 'rxjs';

import { Store } from '@ngrx/store';

import { LayoutSplitDirection } from '../../models/layout-splittable-region.model';
import { ShellSplitterHandleComponent } from '../shell-splitter-handle/shell-splitter-handle.component';
import { DockZonePanelComponent } from '../dock-zone-panel/dock-zone-panel.component';
import { DockZone } from '../../../core/models/dock-zone-assignment.model';
import { DragDropService } from '../../services/drag-drop.service';
import { ShellTab } from '../../contracts/ShellTab';
import {
    moveTabToZone,
    selectActiveIds,
    selectShellTabs,
    selectTab
} from '../../../core/state/workspace';
import {
    startZoneResize,
    commitZoneDimension,
    cancelZoneResize
} from '../../../core/state/layout/layout.actions';
import { ShellSplitterDragService } from '../../services/splitter-drag.service';
import { InternalZoneDragDraft, InternalZoneDragEnd, DragDirection } from '../../services/splitter-drag-operation';

interface PanelState {
    visible: boolean;
    zone: DockZone;
    row: number;
    column: number;
}

class DockPanelPayload {
    el: HTMLElement;

    constructor(
        public panel: DockZonePanelComponent,
        public tabs: ShellTab[]
    ) {
        this.el = panel.el.nativeElement as HTMLElement;
    }
}

@Component({
    selector: 'app-layout-splittable-panel',
    imports: [
        NgClass,
        ShellSplitterHandleComponent,
        DockZonePanelComponent,
        AsyncPipe,
    ],
    templateUrl: './layout-splittable-panel.component.html',
    styleUrls: ['./layout-splittable-panel.component.css']
})
export class LayoutSplittablePanelComponent
    implements OnInit, AfterViewInit {

    private readonly store = inject(Store);
    private readonly dragDropService = inject(DragDropService);
    readonly splitterDragService = inject(ShellSplitterDragService);

    readonly selectShellTabs$ = this.store.select(selectShellTabs);
    readonly selectActiveIds$ = this.store.select(selectActiveIds);

    @Input() direction: LayoutSplitDirection = 'horizontal';
    @Input() zones: Array<DockZone[]> = [];
    @Input() visible: boolean = true;

    @Input() showVerticalSplitButton: boolean = false;
    @Input() showHorizontalSplitButton: boolean = false;
    @Input() showClose: boolean = true;

    @Output() closePanel: EventEmitter<boolean> = new EventEmitter()

    @ViewChildren(DockZonePanelComponent)
    dockZonePanels!: QueryList<DockZonePanelComponent>;

    panelStates: PanelState[][] = [];
    panels = new Map<DockZone, DockPanelPayload>();
    columns: number = 0;
    rows: number = 0;

    // Draft dimension state for internal zone resize
    _draftInternalZoneDimension: InternalZoneDragDraft | null = null;

    get rowsArray() {
        return Array.from({ length: this.rows }, (_, i) => i);
    }


    ngOnInit(): void {
        this.initializePanelsStates();
        this.subscribeToDraftDimensions();
    }


    ngAfterViewInit(): void {
        this.initializePanels();
        this.registerDropZones();
    }

    private initializePanelsStates(): void {
        this.rows = this.zones.length;
        if (!this.rows) {
            console.error('Invalid or empty dock zone array, it must have at least one row');
            return;
        }

        this.columns = this.zones[0].length;
        if (!this.columns) {
            console.error('Invalid or empty dock zone array, it must have at least one column');
            return;
        }

        this.panelStates = Array.from({ length: this.rows }, (_, r) =>
            Array.from({ length: this.columns }, (_, c) => ({
                column: c,
                row: r,
                zone: this.zones[r][c],
                visible: r === 0 && c === 0
            }))
        );
    }

    private initializePanels(): void {
        const tempPanels = new Map<DockZone, DockPanelPayload>();

        const flatStatesArray = this.panelStates.flat();
        for (const state of flatStatesArray) {
            const panel = this.dockZonePanels.find(
                p => p.zone === state.zone
            );

            if (!panel) {
                continue;
            }

            tempPanels.set(
                state.zone,
                new DockPanelPayload(panel, [])
            );
        }

        this.panels = tempPanels;
    }

    private registerDropZones(): void {
        for (const [zone, payload] of this.panels.entries()) {
            this.dragDropService.registerDropZone(
                zone,
                payload.el
            );
        }
    }

    findPanelByDockZone(zone: DockZone): PanelState | undefined {
        return this.panelStates.flat().find((ps: PanelState) => ps.zone === zone);
    }

    isPanelVisible(zone: DockZone): boolean {
        const found = this.findPanelByDockZone(zone);
        if (!found) {
            console.warn('Panel not found');
        }
        return found?.visible ?? false;
    }

    getPanelTabs(
        zone: DockZone
    ): Observable<readonly ShellTab[]> {
        return this.selectShellTabs$.pipe(
            map(tabsByZone => tabsByZone.get(zone) || [])
        );
    }

    getActiveTabIdByZone(
        zone: DockZone
    ): Observable<string> {
        return this.selectActiveIds$.pipe(
            map(activeIds => activeIds.get(zone) || '')
        );
    }

    onActiveTabChanged(tabId: string): void {
        this.store.dispatch(selectTab({ tabId }));
    }

    areAllColumnsVisible() {
        return this.panelStates[0].every(ps => ps.visible);
    }

    areAllRowsVisible() {
        return this.panelStates.every(row => row.some(col => col.visible));
    }

    onSplitPanels(event: MouseEvent, direction: LayoutSplitDirection): void {
        if (direction === 'horizontal') {
            // Busca la primera columna totalmente oculta
            const numCols = this.panelStates[0].length;
            const colIndices = Array.from({ length: numCols }, (_, i) => i);
            const firstDisabledIndex = colIndices.findIndex(col =>
                this.panelStates.every(row => !row[col].visible)
            );
            if (firstDisabledIndex >= 0) {
                this.panelStates.forEach(row => {
                    row[firstDisabledIndex].visible = row[0].visible;
                });
            }
        } else {
            // Busca la primera fila totalmente oculta
            const firstDisabledRow = this.panelStates.findIndex(r => r.every(p => !p.visible));
            if (firstDisabledRow >= 0) {
                this.panelStates[firstDisabledRow].forEach((c, index) => {
                    c.visible = this.panelStates[0][index].visible;
                });
            }
        }
    }

    onVisivilityChange(isClosed: boolean, zone: DockZone, htmlElement: HTMLElement) {
        const panelState = this.findPanelByDockZone(zone);
        if (panelState) {
            panelState.visible = false;
            this.moveAllTabsToZone(panelState);
            this.rearangeOtherPanels(panelState, htmlElement);
        }
    }

    private rearangeOtherPanels(hidenPanel: PanelState, htmlElement: HTMLElement) {
        // Set flex property to other panels in the same row only if panel isn't at the top but is at left side
        const isLeftPanel = hidenPanel.column === 0 && hidenPanel.row !== 0;
        if (isLeftPanel) {
            const nextPanel = htmlElement.nextSibling as HTMLElement;
            if (nextPanel) {
                nextPanel.style.flex = '1';
            }
        }
    }

    private moveAllTabsToZone(sourcePanel: PanelState) {
        const firstPanelVisible = this.resolveFirstActivePanel();
        if (!firstPanelVisible) return;

        this.getPanelTabs(sourcePanel.zone).pipe(
            take(1)
        ).subscribe((tabs: readonly ShellTab[]) => {
            tabs.forEach(tab => {
                this.store.dispatch(moveTabToZone({
                    sourceZone: sourcePanel.zone,
                    tabId: tab.id,
                    targetZone: firstPanelVisible.zone,
                    tabMetadata: tab
                }));
            });
        });
    }

    private resolveFirstActivePanel(): PanelState | undefined {
        return this.panelStates.flat().find(ps => ps.visible);
    }

    invertDirection(direction: LayoutSplitDirection) {
        return direction === 'horizontal' ? 'vertical' : 'horizontal';
    }

    getNestedZones(index: number): Array<DockZone> {
        if (typeof this.zones == 'string') return [];
        const currentZones = this.zones[index];
        if (typeof currentZones === 'string') return [];
        return currentZones as Array<DockZone>;
    }

    isRowVisible(index: number) {
        return this.panelStates[index].some(ps => ps.visible);
    }

    hasPreviousColumnEnabled(panel: PanelState): boolean {
        if (panel.column == 0) {
            return false;
        }
        const found = this.panelStates[panel.row];
        if (!found) return false;

        const columnFound = found.find(c => c.column < panel.column && c.visible);

        if (!columnFound) return false;

        return columnFound.visible;
    }

    handleClosePanel(event: MouseEvent) {
        this.closePanel.emit(!this.visible);
    }

    getZoneForRow(rowIndex: number): DockZone {
        const row = this.panelStates[rowIndex];
        if (!row) return null as any;
        const visiblePanel = row.find(p => p.visible);
        return visiblePanel?.zone || null as any;
    }

    getRowHeight(rowIndex: number): number {
        // Try to get the actual height from the dockZonePanels
        const rowPanels = this.panelStates[rowIndex] || [];
        const visiblePanel = rowPanels.find(ps => ps.visible);
        if (visiblePanel) {
            const panel = this.dockZonePanels.find(p => p.zone === visiblePanel.zone);
            if (panel && panel.el.nativeElement) {
                const rect = panel.el.nativeElement.getBoundingClientRect();
                return Math.max(100, Math.round(rect.height));
            }
        }
        // Default height for a row
        return 200;
    }

    getColumnWidth(columnIndex: number): number {
        // Try to get the actual width from the dockZonePanels
        const flatStates = this.panelStates.flat();
        const visiblePanel = flatStates.find(ps => ps.column === columnIndex && ps.visible);
        if (visiblePanel) {
            const panel = this.dockZonePanels.find(p => p.zone === visiblePanel.zone);
            if (panel && panel.el.nativeElement) {
                const rect = panel.el.nativeElement.getBoundingClientRect();
                return Math.max(100, Math.round(rect.width));
            }
        }
        // Default width for a column
        return 200;
    }

    /**
     * Returns the style properties (width and flex) for a panel based on the current draft dimension state.
     */
    getPanelStyleProps(panel: PanelState, htmlElement: HTMLElement): { width: string; flex: string } {

        if (!this._draftInternalZoneDimension || this._draftInternalZoneDimension.zone !== panel.zone) {
            return {
                width: htmlElement.style.width,
                flex: htmlElement.style.flex,
            };
        }

        if (this._draftInternalZoneDimension.direction === 'horizontal') {
            const draftDim = this._draftInternalZoneDimension.draftDimension || 0;
            return {
                width: draftDim + 'px',
                flex: `0 0 ${draftDim}px`,
            };
        }

        return {
            width: '',
            flex: '1',
        };
    }

    /**
     * Returns the flex style property for a row wrapper based on the current draft dimension state for vertical resizing.
     */
    getRowStyleProps(rowIndex: number, htmlElement: HTMLElement): { flex: string } {
        if (!this._draftInternalZoneDimension || this._draftInternalZoneDimension.direction !== 'vertical') {
            return {
                flex: htmlElement.style.flex,
            };
        }

        const rowZone = this.getZoneForRow(rowIndex);
        if (this._draftInternalZoneDimension.zone !== rowZone) {
            return {
                flex: '1',
            };
        }

        const draftDim = this._draftInternalZoneDimension.draftDimension || 0;
        return {
            flex: `0 0 ${draftDim}px`,
        };
    }

    private subscribeToDraftDimensions(): void {
        this.splitterDragService.draftInternalZoneDimension$
            .subscribe((draft) => {
                this._draftInternalZoneDimension = draft;
            });

        this.splitterDragService.onInternalZoneDragEnd$
            .subscribe((commit: InternalZoneDragEnd) => {
                this.store.dispatch(commitZoneDimension({
                    zone: commit.zone,
                    committedDimension: commit.committedDimension,
                }));
            });
    }

    onSplitterPointerDown(event: PointerEvent, zone: DockZone, direction: DragDirection, initialDimension: number): void {
        this.store.dispatch(startZoneResize({ zone, direction, initialDimension }));
        this.splitterDragService.onInternalZonePointerDown(event, zone, direction, initialDimension);
    }

    onSplitterPointerMove(event: PointerEvent): void {
        this.splitterDragService.onInternalZonePointerMove(event);
    }

    onSplitterPointerUp(event: PointerEvent): void {
        this.splitterDragService.onInternalZonePointerUp(event);
    }

    onSplitterPointerCancel(event: PointerEvent): void {
        this.splitterDragService.onInternalZonePointerCancel(event);
        this.store.dispatch(cancelZoneResize());
    }
}