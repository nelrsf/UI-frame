import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mock-bottom-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mock-bottom-panel-container">

      <div class="panel-tabs">
        <div class="tab" 
             *ngFor="let tab of tabs; let i = index"
             [class.active]="activeTab === i"
             (click)="activeTab = i">
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </div>
      </div>

      <div class="panel-content">
        <div [ngSwitch]="activeTab">
          <!-- Results Tab -->
          <div *ngSwitchCase="0" class="tab-content">
            <div class="results-grid">
              <div class="result-item" *ngFor="let item of items; let i = index">
                <div class="result-number">{{ i + 1 }}</div>
                <div class="result-info">
                  <div class="result-title">{{ item.title }}</div>
                  <div class="result-meta">{{ item.meta }}</div>
                </div>
                <div class="result-status" [class]="'status-' + item.status">
                  {{ item.status }}
                </div>
              </div>
            </div>
          </div>

          <!-- Logs Tab -->
          <div *ngSwitchCase="1" class="tab-content">
            <div class="logs-container">
              <div class="log-entry" *ngFor="let log of logs" [class]="'log-' + log.level">
                <span class="log-timestamp">{{ log.timestamp }}</span>
                <span class="log-level">{{ log.level }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>

          <!-- Warnings Tab -->
          <div *ngSwitchCase="2" class="tab-content">
            <div class="warnings-container">
              <div class="warning-item" *ngFor="let warning of warnings">
                <div class="warning-icon">⚠️</div>
                <div class="warning-details">
                  <div class="warning-title">{{ warning.title }}</div>
                  <div class="warning-message">{{ warning.message }}</div>
                  <div class="warning-action">
                    <button class="action-btn">Resolve</button>
                    <button class="action-btn secondary">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mock-bottom-panel-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
      border-top: 2px solid #007acc;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(90deg, #2d2d30 0%, #1e1e1e 100%);
      border-bottom: 1px solid #3e3e42;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .panel-icon {
      font-size: 18px;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #cccccc;
    }

    .info-badge {
      background: rgba(0, 122, 204, 0.2);
      color: #4fc3f7;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .panel-tabs {
      display: flex;
      gap: 2px;
      padding: 0 16px;
      background: #252526;
      border-bottom: 1px solid #3e3e42;
      overflow-x: auto;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      color: #858585;
      transition: all 0.2s ease;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 500;
    }

    .tab:hover {
      color: #cccccc;
      background: rgba(255, 255, 255, 0.05);
    }

    .tab.active {
      color: #007acc;
      border-bottom-color: #007acc;
    }

    .tab-icon {
      font-size: 14px;
    }

    .panel-content {
      flex: 1;
      overflow: hidden;
      background: #1e1e1e;
    }

    .tab-content {
      height: 100%;
      overflow-y: auto;
      padding: 12px;
    }

    /* Results Grid */
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

    /* Logs Container */
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

    /* Warnings Container */
    .warnings-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .warning-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 152, 0, 0.1);
      border: 1px solid rgba(255, 152, 0, 0.3);
      border-radius: 4px;
    }

    .warning-icon {
      font-size: 20px;
      min-width: 24px;
      text-align: center;
    }

    .warning-details {
      flex: 1;
    }

    .warning-title {
      font-size: 12px;
      font-weight: 600;
      color: #ffb74d;
      margin-bottom: 4px;
    }

    .warning-message {
      font-size: 11px;
      color: #b4b4b4;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .warning-action {
      display: flex;
      gap: 6px;
    }

    .action-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #007acc;
      color: white;
    }

    .action-btn:hover {
      background: #005a9e;
    }

    .action-btn.secondary {
      background: transparent;
      color: #858585;
      border: 1px solid #858585;
    }

    .action-btn.secondary:hover {
      color: #cccccc;
      border-color: #cccccc;
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
  `]
})
export class MockBottomPanelComponent {
  activeTab = 0;

  tabs = [
    { icon: '✓', label: 'Results' },
    { icon: '📄', label: 'Logs' },
    { icon: '⚠️', label: 'Warnings' },
  ];

  items = [
    { title: 'Build successful', meta: '2 modules compiled', status: 'success' },
    { title: 'Tests passed', meta: '45/45 tests', status: 'success' },
    { title: 'Lint warnings', meta: '3 warnings found', status: 'warning' },
    { title: 'Deploy ready', meta: 'No errors detected', status: 'success' },
    { title: 'Performance check', meta: 'Optimization needed', status: 'warning' },
  ];

  logs = [
    { timestamp: '14:32:05', level: 'info', message: 'Application started successfully' },
    { timestamp: '14:32:06', level: 'debug', message: 'Loading configuration modules' },
    { timestamp: '14:32:07', level: 'info', message: 'Database connection established' },
    { timestamp: '14:32:08', level: 'debug', message: 'Initializing UI components' },
    { timestamp: '14:32:09', level: 'info', message: 'Ready for user interaction' },
  ];

  warnings = [
    {
      title: 'Deprecated API Usage',
      message: 'The getUser() method is deprecated. Please use getUserData() instead. This will be removed in v2.0.',
    },
    {
      title: 'Performance Warning',
      message: 'High memory usage detected. Consider optimizing your data loading strategy.',
    },
  ];
}
