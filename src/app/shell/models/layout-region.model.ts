export enum LayoutRegion {
  TopBar = 'top-bar',
  Sidebar = 'sidebar',
  Workspace = 'workspace',
  StatusBar = 'status-bar',
  Toolbar = 'toolbar',
  TabBar = 'tab-bar',
  ContentArea = 'content-area',
  BottomPanel = 'bottom-panel',
}

export interface LayoutRegionState {
  region: LayoutRegion;
  visible: boolean;
}

export interface LayoutSnapshot {
  regions: Partial<Record<LayoutRegion, boolean>>;
  sidebarWidth: number;
  bottomPanelHeight: number;
  timestamp: number;
}
