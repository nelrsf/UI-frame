export interface MockDashboardCard {
  id: string;
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
}
