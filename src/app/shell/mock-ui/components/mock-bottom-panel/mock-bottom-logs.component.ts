import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mock-bottom-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content">
      <div class="logs-container">
        <div class="log-entry" *ngFor="let log of logs" [class]="'log-entry log-' + log.level">
          <span class="log-timestamp">{{ log.timestamp }}</span>
          <span class="log-level">{{ log.level }}</span>
          <span class="log-message">{{ log.message }}</span>
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

    .logs-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-family: var(--font-family-mono);
    }

    .log-entry {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      font-size: 11px;
      border-radius: var(--radius-sm);
      background: var(--color-bg-base);
    }

    .log-timestamp {
      color: var(--color-text-disabled);
      min-width: 60px;
    }

    .log-level {
      padding: 0 6px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      min-width: 50px;
      text-align: center;
    }

    .log-info .log-level {
      background: rgba(33, 150, 243, 0.2);
      color: var(--color-info);
    }

    .log-debug .log-level {
      background: rgba(156, 39, 176, 0.2);
      color: #9c27b0;
    }

    .log-error .log-level {
      background: rgba(244, 67, 54, 0.2);
      color: var(--color-error);
    }

    .log-message {
      flex: 1;
      color: var(--color-text-secondary);
      word-break: break-word;
    }
  `],
})
export class MockBottomLogsComponent {
  readonly logs = [
    { timestamp: '14:32:05', level: 'info', message: 'Application started successfully' },
    { timestamp: '14:32:06', level: 'debug', message: 'Loading configuration modules' },
    { timestamp: '14:32:07', level: 'info', message: 'Database connection established' },
    { timestamp: '14:32:08', level: 'debug', message: 'Initializing UI components' },
    { timestamp: '14:32:09', level: 'info', message: 'Ready for user interaction' },
  ];
}