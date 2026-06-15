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

    get rowsArray() {
        return Array.from({ length: this.rows }, (_, i) => i);
    }


    ngOnInit(): void {
        this.initializePanelsStates();
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

    areAllPanelsVisible() {
        return this.panelStates.flat().every(ps => ps.visible);
    }

    areAllRowsVisible() {
        return this.panelStates.every(row => row.some(col => col.visible));
    }

    /**
    * Expands the first hidden column (horizontal) or row (vertical)
    * found in panelStates by setting all its panels to visible.
     *
    * @param event - Mouse event that triggered the split
    * @param direction - 'horizontal' expands by column, 'vertical' expands by row
    */
    onSplitPanels(event: MouseEvent, direction: LayoutSplitDirection): void {
        if (direction == 'horizontal') {
            // Busca la primera columna con algún panel oculto
            for (let i = 0; i < this.columns; i++) {
                const firstDisabledIndex = this.panelStates[i].findIndex(ps => !ps.visible);
                if (firstDisabledIndex >= 0) {
                    this.panelStates.forEach(psRow => psRow[firstDisabledIndex].visible = true);
                    break;
                }
            }
        } else {
            // Busca la primera fila con algún panel oculto
            for (let j = 0; j < this.panelStates[0].length; j++) {
                const row = this.panelStates.map(col => col[j]);
                if (row.some(ps => !ps.visible)) {
                    row.forEach(ps => ps.visible = true);
                    break;
                }
            }
        }
    }

    onVisivilityChange(isClosed: boolean, zone: DockZone) {
        const panelState = this.findPanelByDockZone(zone);
        if (panelState) {
            panelState.visible = false;
            this.moveAllTabsToZone(panelState);
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
}