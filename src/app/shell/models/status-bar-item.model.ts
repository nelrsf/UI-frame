export interface StatusBarItem {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  color?: 'default' | 'warning' | 'error' | 'success';
  clickable: boolean;
  commandId?: string;
}
