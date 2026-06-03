import { AsyncPipe, NgClass, NgStyle } from "@angular/common";
import { AfterViewInit, Component, HostBinding, HostListener, inject, Input, OnInit, QueryList, ViewChildren } from "@angular/core";
import { LayoutSplitDirection } from "../../models/layout-splittable-region.model";
import { ShellSplitterHandleComponent } from "../shell-splitter-handle/shell-splitter-handle.component";
import { DockZonePanelComponent } from "../dock-zone-panel/dock-zone-panel.component";
import { DockZone } from "../../../core/models/dock-zone-assignment.model";
import { DragDropService } from "../../services/drag-drop.service";
import { ShellTab } from "../../contracts/ShellTab";
import { map, Observable } from "rxjs";
import { reorderTab, selectActiveIds, selectShellTabs, selectTab } from "../../../core/state/workspace";
import { Store } from "@ngrx/store";


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
    imports: [NgClass, NgStyle, 
        ShellSplitterHandleComponent, 
        DockZonePanelComponent,
        AsyncPipe],
    templateUrl: './layout-splittable-panel.component.html',
    styleUrls: ['./layout-splittable-panel.component.css'],
})
export class LayoutSplittablePanelComponent implements AfterViewInit {


    private readonly store = inject(Store);

    readonly selectShellTabs$ = this.store.select(selectShellTabs);
    readonly selectActiveIds$ = this.store.select(selectActiveIds);

    @Input() direction: LayoutSplitDirection = 'horizontal';
    @Input() zones: DockZone[] = [];
    @Input() visible: boolean = true;

    @ViewChildren(DockZonePanelComponent) dockZonePanels!: QueryList<DockZonePanelComponent>;

    private panels: Map<DockZone, DockPanelPayload> = new Map();
    private dragDropService = inject(DragDropService);


    ngAfterViewInit() {
        this.initializeTabsGroups();
        this.registerDropZones();
    }

    private initializeTabsGroups() {
        for (const zone of this.zones) {
            const panel = this.dockZonePanels.find(p => p.zone === zone);
            if (!panel) {
                continue;
            }
            this.panels.set(zone, new DockPanelPayload(panel, []));
        }
    }

    private registerDropZones() {
        for (const [zone, payload] of this.panels.entries()) {
            this.dragDropService.registerDropZone(zone, payload.el);
        }
    }

    getPanelTabs(zone: DockZone): Observable<readonly ShellTab[]> {
        return this.selectShellTabs$.pipe(
            map((tabsByZone) => {
                return tabsByZone.get(zone) || [];
            })
        );
    }

    getActiveTabIdByZone(zone: DockZone): Observable<string> {
        return this.selectActiveIds$.pipe(
            map((activeIdsByZone) => activeIdsByZone.get(zone) || '')
        );
    }

    onActiveTabChanged(tabId: string) {
        this.store.dispatch(selectTab({ tabId }));
    }

}