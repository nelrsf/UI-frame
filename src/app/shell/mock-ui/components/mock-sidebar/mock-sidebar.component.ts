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
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 16px;
      border-left: 3px solid #4a90e2;
    }

    .sidebar-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid rgba(74, 144, 226, 0.3);
    }

    .sidebar-header h3 {
      margin: 0;
      color: #2c3e50;
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
      color: #7f8c8d;
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
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.6);
    }

    .nav-item:hover,
    .tool-item:hover {
      background: rgba(74, 144, 226, 0.15);
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
      color: #2c3e50;
      font-weight: 500;
    }

    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(74, 144, 226, 0.3), transparent);
      margin: 12px 0;
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 12px;
    }

    .status-label {
      color: #7f8c8d;
      font-weight: 600;
    }

    .status-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(74, 144, 226, 0.1);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(74, 144, 226, 0.3);
      border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(74, 144, 226, 0.5);
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
