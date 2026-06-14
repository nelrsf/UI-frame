import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mock-bottom-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content">
      <div class="results-grid">
        <div class="result-item" *ngFor="let item of items; let index = index">
          <div class="result-number">{{ index + 1 }}</div>
          <div class="result-info">
            <div class="result-title">{{ item.title }}</div>
            <div class="result-meta">{{ item.meta }}</div>
          </div>
          <div class="result-status" [class]="'result-status status-' + item.status">
            {{ item.status }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      background: var(--color-panel-bg);
      color: var(--color-text-primary);
    }

    .tab-content {
      height: 100%;
      overflow-y: auto;
      padding: 12px;
    }

    .results-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: var(--color-bg-elevated);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--color-accent);
      transition: all 0.2s ease;
    }

    .result-item:hover {
      background: var(--color-bg-hover);
      transform: translateX(4px);
    }

    .result-number {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      width: 24px;
      height: 24px;
      background: var(--color-accent);
      color: var(--color-text-inverse);
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
    }

    .result-info {
      flex: 1;
    }

    .result-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 2px;
    }

    .result-meta {
      font-size: 11px;
      color: var(--color-text-secondary);
    }

    .result-status {
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-success {
      background: rgba(76, 175, 80, 0.2);
      color: var(--color-success);
    }

    .status-warning {
      background: rgba(255, 193, 7, 0.2);
      color: var(--color-warning);
    }

    .status-error {
      background: rgba(244, 67, 54, 0.2);
      color: var(--color-error);
    }
  `],
})
export class MockBottomResultsComponent {
  readonly items = [
    { title: 'Build successful', meta: '2 modules compiled', status: 'success' },
    { title: 'Tests passed', meta: '45/45 tests', status: 'success' },
    { title: 'Lint warnings', meta: '3 warnings found', status: 'warning' },
    { title: 'Deploy ready', meta: 'No errors detected', status: 'success' },
    { title: 'Performance check', meta: 'Optimization needed', status: 'warning' },
  ];
}