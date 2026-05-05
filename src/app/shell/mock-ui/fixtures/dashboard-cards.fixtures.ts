import { MockDashboardCard } from '../models';

export const MOCK_DASHBOARD_CARDS: MockDashboardCard[] = [
  { id: 'card-1', title: 'Active Sessions', value: '42', trend: 'up' },
  { id: 'card-2', title: 'Pending Tasks', value: '7', trend: 'down' },
  { id: 'card-3', title: 'CPU Usage', value: '34 %', trend: 'stable' },
  { id: 'card-4', title: 'Memory Used', value: '2.1 GB', trend: 'up' },
];
