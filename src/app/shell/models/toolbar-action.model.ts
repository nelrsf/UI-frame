export interface BreadcrumbItem {
  label: string;
  routeSegment?: string;
}

export interface ToolbarAction {
  id: string;
  /**
   * Optional command identifier.  When set, clicking this action dispatches
   * the matching command through `CommandRegistryService`.
   */
  commandId?: string;
  icon: string;
  label: string;
  tooltip: string;
  disabled?: boolean;
  active?: boolean;
  group: 'primary' | 'secondary' | 'layout';
}
