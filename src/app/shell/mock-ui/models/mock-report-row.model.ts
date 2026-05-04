export interface MockReportRow {
  id: string;
  reportName: string;
  owner: string;
  lastRun?: string;
  state: 'ready' | 'running' | 'failed';
}
