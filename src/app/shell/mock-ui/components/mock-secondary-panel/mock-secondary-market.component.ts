import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MOCK_MARKET_TICKERS } from '../../fixtures/mock-secondary-panel.fixtures';

@Component({
  selector: 'app-mock-secondary-market',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './mock-secondary-market.component.html',
  styles: [
    ':host { display: block; }',
    '.market-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }',
    '.market-item { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; padding: 8px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); background: var(--color-bg-elevated); }',
    '.market-symbol { font-weight: 600; color: var(--color-text-primary); }',
    '.market-change-up { color: var(--color-success); }',
    '.market-change-down { color: var(--color-error); }'
  ]
})
export class MockSecondaryMarketComponent {
  readonly tickers = MOCK_MARKET_TICKERS;
}
