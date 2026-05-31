import { NgClass, NgStyle } from "@angular/common";
import { Component, Input } from "@angular/core";
import { LayoutSplitDirection } from "../../models/layout-splittable-region.model";

@Component({
    selector: 'app-layout-splittable-panel',
    imports: [NgClass, NgStyle],
    templateUrl: './layout-splittable-panel.component.html',
    styleUrls: ['./layout-splittable-panel.component.css'],
})
export class LayoutSplittablePanelComponent {
    @Input() direction: LayoutSplitDirection = 'horizontal';
    @Input() maxsubregions: number = 2;
}