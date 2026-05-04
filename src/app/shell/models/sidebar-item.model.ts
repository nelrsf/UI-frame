export interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  tooltip: string;
  badge?: number;
  position: 'top' | 'bottom';
}
