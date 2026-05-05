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
      background: #1e1e1e;
      color: #d4d4d4;
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
      font-family: 'Consolas', 'Monaco', monospace;
    }

    .log-entry {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      font-size: 11px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.02);
    }

    .log-timestamp {
      color: #858585;
      min-width: 60px;
    }

    .log-level {
      padding: 0 6px;
      border-radius: 2px;
      font-weight: 600;
      min-width: 50px;
      text-align: center;
    }

    .log-info .log-level {
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }

    .log-debug .log-level {
      background: rgba(156, 39, 176, 0.2);
      color: #9c27b0;
    }

    .log-error .log-level {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    .log-message {
      flex: 1;
      color: #b4b4b4;
      word-break: break-word;
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
export class MockBottomLogsComponent {
  readonly logs = [
    { timestamp: '14:32:05', level: 'info', message: 'Application started successfully' },
    { timestamp: '14:32:06', level: 'debug', message: 'Loading configuration modules' },
    { timestamp: '14:32:07', level: 'info', message: 'Database connection established' },
    { timestamp: '14:32:08', level: 'debug', message: 'Initializing UI components' },
    { timestamp: '14:32:09', level: 'info', message: 'Ready for user interaction' },
  ];
}