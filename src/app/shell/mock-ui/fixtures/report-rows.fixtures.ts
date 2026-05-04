import { MockReportRow } from '../models';

export const MOCK_REPORT_ROWS: MockReportRow[] = [
  {
    id: 'report-1',
    reportName: 'Monthly Performance Summary',
    owner: 'alice@example.com',
    lastRun: '2026-05-01T09:00:00Z',
    state: 'ready',
  },
  {
    id: 'report-2',
    reportName: 'Security Audit Log',
    owner: 'bob@example.com',
    lastRun: '2026-05-03T14:30:00Z',
    state: 'running',
  },
  {
    id: 'report-3',
    reportName: 'Weekly Build Stats',
    owner: 'carol@example.com',
    lastRun: '2026-04-28T11:00:00Z',
    state: 'failed',
  },
  {
    id: 'report-4',
    reportName: 'User Activity Overview',
    owner: 'dave@example.com',
    state: 'ready',
  },
];
