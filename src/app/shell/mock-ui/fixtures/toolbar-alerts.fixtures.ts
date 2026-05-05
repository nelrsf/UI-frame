import { MockToolbarAlert } from '../models';

export const MOCK_TOOLBAR_ALERTS: MockToolbarAlert[] = [
  {
    id: 'alert-info',
    level: 'info',
    message: '[MOCK] System check completed successfully.',
    visible: true,
    timestamp: '2026-05-04T08:00:00Z',
  },
  {
    id: 'alert-warning',
    level: 'warning',
    message: '[MOCK] Disk usage is above 75%.',
    visible: true,
    timestamp: '2026-05-04T08:05:00Z',
  },
  {
    id: 'alert-error',
    level: 'error',
    message: '[MOCK] Connection to remote service failed.',
    visible: true,
    timestamp: '2026-05-04T08:10:00Z',
  },
  {
    id: 'alert-success',
    level: 'success',
    message: '[MOCK] Build pipeline passed all checks.',
    visible: true,
    timestamp: '2026-05-04T08:15:00Z',
  },
];
