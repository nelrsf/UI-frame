import { MockBottomResult } from '../models';

export const MOCK_BOTTOM_RESULTS: MockBottomResult[] = [
  {
    id: 'result-1',
    source: 'mock-linter',
    status: 'ok',
    summary: '[MOCK] No issues found in last analysis.',
    createdAt: '2026-05-04T07:50:00Z',
  },
  {
    id: 'result-2',
    source: 'mock-build',
    status: 'warning',
    summary: '[MOCK] 2 deprecation warnings in build output.',
    createdAt: '2026-05-04T07:55:00Z',
  },
  {
    id: 'result-3',
    source: 'mock-test-runner',
    status: 'error',
    summary: '[MOCK] 1 test failed: UserService > login.',
    createdAt: '2026-05-04T08:00:00Z',
  },
  {
    id: 'result-4',
    source: 'mock-security-scan',
    status: 'ok',
    summary: '[MOCK] No vulnerabilities detected.',
    createdAt: '2026-05-04T08:02:00Z',
  },
];
