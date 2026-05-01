export interface BreadcrumbItem {
  label: string;
  routeSegment?: string;
}

export interface ToolbarAction {
  id: string;
  icon: string;
  label: string;
  tooltip: string;
  disabled?: boolean;
  active?: boolean;
  group: 'primary' | 'secondary' | 'layout';
}
