import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

const TOOL_ITEMS = [
  { icon: '🔍', label: 'Search' },
  { icon: '📝', label: 'Notes' },
  { icon: '⭐', label: 'Favorites' },
];

@Component({
  selector: 'app-mock-tools-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section">
      <div
        class="tool-item"
        *ngFor="let tool of items"
        [class.tool-item--active]="activeLabel === tool.label"
        (click)="activeLabel = tool.label"
      >
        <span class="tool-item__icon">{{ tool.icon }}</span>
        <span class="tool-item__label">{{ tool.label }}</span>
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

    .tool-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 8px);
      padding: var(--spacing-2, 8px) var(--spacing-2, 8px);
      border-radius: var(--radius-sm, 2px);
      cursor: pointer;
      transition: background var(--transition-fast, 100ms ease);
      color: var(--color-text-primary, #cccccc);
    }

    .tool-item:hover {
      background: var(--color-bg-hover, #2a2d2e);
    }

    .tool-item--active {
      background: var(--color-bg-active, #094771);
      color: var(--color-text-primary, #cccccc);
    }

    .tool-item__icon {
      font-size: var(--font-size-md, 14px);
      min-width: 20px;
      text-align: center;
    }

    .tool-item__label {
      font-size: var(--font-size-sm, 12px);
      font-weight: var(--font-weight-medium, 500);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class MockToolsSectionComponent {
  readonly items = TOOL_ITEMS;
  activeLabel = '';
}
