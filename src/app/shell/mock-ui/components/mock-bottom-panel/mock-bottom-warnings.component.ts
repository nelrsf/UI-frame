import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mock-bottom-warnings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content">
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
  `],
})
export class MockBottomWarningsComponent {
  readonly warnings = [
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