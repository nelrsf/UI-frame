import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mock-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mock-sidebar-container">
      <div class="sidebar-header">
        <h3>📁 Sidebar Panel</h3>
      </div>
      
      <div class="sidebar-content">
        <div class="nav-section">
          <div class="section-title">Navigation</div>
          <div class="nav-item" *ngFor="let item of navigationItems">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="tools-section">
          <div class="section-title">Tools</div>
          <div class="tool-item" *ngFor="let tool of tools">
            <span class="tool-icon">{{ tool.icon }}</span>
            <span class="tool-label">{{ tool.label }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="status-section">
          <div class="status-item">
            <span class="status-label">Status:</span>
            <span class="status-badge">✓ Active</span>
          </div>
          <div class="status-item">
            <span class="status-label">Items:</span>
            <span class="status-badge">{{ navigationItems.length + tools.length }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mock-sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-bg-elevated);
      padding: 16px;
      border-left: 3px solid var(--color-accent);
    }

    .sidebar-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--color-border-subtle);
    }

    .sidebar-header h3 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 14px;
      font-weight: 600;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
    }

    .nav-section,
    .tools-section,
    .status-section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      padding: 0 4px;
    }

    .nav-item,
    .tool-item {
      display: flex;
      align-items: center;
      padding: 8px 8px;
      margin-bottom: 6px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--color-bg-overlay);
    }

    .nav-item:hover,
    .tool-item:hover {
      background: var(--color-bg-hover);
      transform: translateX(4px);
    }

    .nav-icon,
    .tool-icon {
      font-size: 18px;
      margin-right: 8px;
      min-width: 20px;
      text-align: center;
    }

    .nav-label,
    .tool-label {
      font-size: 13px;
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .divider {
      height: 1px;
      background: var(--color-border-subtle);
      margin: 12px 0;
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      background: var(--color-bg-overlay);
      border-radius: var(--radius-md);
      margin-bottom: 4px;
      font-size: 12px;
    }

    .status-label {
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    .status-badge {
      background: var(--color-accent);
      color: var(--color-text-inverse);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: var(--color-bg-hover);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--color-border-default);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-accent);
    }
  `]
})
export class MockSidebarComponent {
  navigationItems = [
    { icon: '📊', label: 'Dashboard' },
    { icon: '📈', label: 'Analytics' },
    { icon: '👥', label: 'Users' },
    { icon: '⚙️', label: 'Settings' },
  ];

  tools = [
    { icon: '🔍', label: 'Search' },
    { icon: '📝', label: 'Notes' },
    { icon: '⭐', label: 'Favorites' },
  ];
}
