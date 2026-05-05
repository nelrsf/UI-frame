export interface MockBottomResult {
  id: string;
  source: string;
  status: 'ok' | 'warning' | 'error';
  summary: string;
  createdAt?: string;
}
