export interface MockToolbarAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  visible: boolean;
  timestamp?: string;
}
