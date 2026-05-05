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
      background: #1e1e1e;
      color: #d4d4d4;
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
      background: #252526;
      border-radius: 4px;
      border-left: 3px solid #007acc;
      transition: all 0.2s ease;
    }

    .result-item:hover {
      background: #2d2d30;
      transform: translateX(4px);
    }

    .result-number {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      width: 24px;
      height: 24px;
      background: #007acc;
      color: white;
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
      color: #cccccc;
      margin-bottom: 2px;
    }

    .result-meta {
      font-size: 11px;
      color: #858585;
    }

    .result-status {
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-success {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    .status-warning {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-error {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #424242;
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #4e4e4e;
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