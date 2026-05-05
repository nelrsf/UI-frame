import { Type } from '@angular/core';

/**
 * Public contract for registering a panel tab in the shell's bottom panel.
 *
 * Implementations are registered with ShellManager.addBottomPanelEntry() and
 * appear as selectable tabs in the bottom panel region. The shell translates
 * this contract to its internal PanelTab DTO.
 *
 * @example
 * const outputPanel: IBottomPanelEntry = {
 *   id: 'weather-output',
 *   label: 'Weather Output',
 *   icon: 'cloud',
 *   component: WeatherOutputPanelComponent,
 * };
 * shellManager.addBottomPanelEntry(outputPanel);
 */
export interface IBottomPanelEntry {
  /** Stable unique identifier. Duplicate ids are silently ignored. */
  readonly id: string;
  /** Label shown on the panel tab. */
  readonly label: string;
  /** Optional icon shown alongside the label on the panel tab. */
  readonly icon?: string;
  /**
   * Standalone Angular component rendered when this bottom panel tab is active.
   * Must be a standalone component (no NgModule required).
   */
  readonly component: Type<unknown>;
}
