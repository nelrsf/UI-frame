import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard' },
  { icon: '📈', label: 'Analytics' },
  { icon: '👥', label: 'Users' },
  { icon: '⚙️', label: 'Settings' },
];

@Component({
  selector: 'app-mock-nav-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section">
      <div class="section-title">Navigation</div>
      <div
        class="nav-item"
        *ngFor="let item of items"
        [class.nav-item--active]="activeLabel === item.label"
        (click)="activeLabel = item.label"
      >
        <span class="nav-item__icon">{{ item.icon }}</span>
        <span class="nav-item__label">{{ item.label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 4px);
    }

    .section-title {
      font-size: var(--font-size-xs, 11px);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-text-secondary, #9d9d9d);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: var(--spacing-1, 4px) var(--spacing-2, 8px);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 8px);
      padding: var(--spacing-2, 8px) var(--spacing-2, 8px);
      border-radius: var(--radius-sm, 2px);
      cursor: pointer;
      transition: background var(--transition-fast, 100ms ease);
      color: var(--color-text-primary, #cccccc);
    }

    .nav-item:hover {
      background: var(--color-bg-hover, #2a2d2e);
    }

    .nav-item--active {
      background: var(--color-bg-active, #094771);
      color: var(--color-text-primary, #cccccc);
    }

    .nav-item__icon {
      font-size: var(--font-size-md, 14px);
      min-width: 20px;
      text-align: center;
    }

    .nav-item__label {
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-medium, 500);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class MockNavSectionComponent {
  readonly items = NAV_ITEMS;
  activeLabel = 'Dashboard';
}
