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
      background: var(--color-panel-bg);
      color: var(--color-text-primary);
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
      background: color-mix(in srgb, var(--color-warning) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-warning) 30%, transparent);
      border-radius: var(--radius-md);
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
      color: var(--color-warning);
      margin-bottom: 4px;
    }

    .warning-message {
      font-size: 11px;
      color: var(--color-text-secondary);
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
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--color-accent);
      color: var(--color-text-inverse);
    }

    .action-btn:hover {
      background: var(--color-accent-active);
    }

    .action-btn.secondary {
      background: transparent;
      color: var(--color-text-disabled);
      border: 1px solid var(--color-text-disabled);
    }

    .action-btn.secondary:hover {
      color: var(--color-text-primary);
      border-color: var(--color-text-primary);
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