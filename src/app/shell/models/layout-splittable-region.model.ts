export type LayoutSplitDirection = 'horizontal' | 'vertical';

export interface LayoutSplitRegion {
    id: string;
    tabsIds: string[];
    activeTabId: string | null;
    visible: boolean;
    size: number | undefined;
}

export interface LayoutSplittableRegionModel {
    direction: LayoutSplitDirection;
    regions: LayoutSplitRegion[];
    maxSubRegions: number;
}