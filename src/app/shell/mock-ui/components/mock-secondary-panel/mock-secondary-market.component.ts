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
    '.market-item { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; padding: 8px; border: 1px solid var(--color-border-subtle, #3e3e3e); border-radius: 6px; background: var(--color-panel-header-bg, #252526); }',
    '.market-symbol { font-weight: 600; }',
    '.market-change-up { color: #4caf50; }',
    '.market-change-down { color: #e57373; }'
  ]
})
export class MockSecondaryMarketComponent {
  readonly tickers = MOCK_MARKET_TICKERS;
}
