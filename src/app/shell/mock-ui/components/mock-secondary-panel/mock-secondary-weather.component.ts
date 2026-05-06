import { Component } from '@angular/core';
import { MOCK_WEATHER_METRICS } from '../../fixtures/mock-secondary-panel.fixtures';

@Component({
  selector: 'app-mock-secondary-weather',
  standalone: true,
  templateUrl: './mock-secondary-weather.component.html',
  styles: [
    ':host { display: block; }',
    '.weather-grid { display: grid; gap: 8px; }',
    '.weather-card { border: 1px solid var(--color-border-subtle, #3e3e3e); border-radius: 6px; padding: 8px; background: var(--color-panel-header-bg, #252526); }',
    '.weather-title { margin: 0 0 4px; font-size: 13px; font-weight: 600; }',
    '.weather-meta { margin: 0; font-size: 12px; color: var(--color-text-secondary, #9d9d9d); }'
  ]
})
export class MockSecondaryWeatherComponent {
  readonly metrics = MOCK_WEATHER_METRICS;
}
