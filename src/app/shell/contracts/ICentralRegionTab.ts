import { Type } from '@angular/core';

/**
 * Public contract for registering content in the shell's central tab region.
 *
 * Any domain application that wants to appear as a tab in the shell's content
 * area MUST provide an object implementing this interface and register it with
 * ShellManager.addTab(). The shell will render the `component` dynamically
 * using NgComponentOutlet without any knowledge of the concrete class.
 *
 * @example
 * // Weather domain registration
 * const weatherTab: ICentralRegionTab = {
 *   id: 'weather-main',
 *   label: 'Weather',
 *   component: WeatherDashboardComponent,
 *   closable: false,
 * };
 * shellManager.addTab(weatherTab);
 */
export interface ICentralRegionTab {
  /** Stable unique identifier. Duplicate ids are silently ignored. */
  readonly id: string;
  /** Text displayed in the tab strip. */
  readonly label: string;
  /**
   * Standalone Angular component rendered inside the content area when this
   * tab is active. Must be a standalone component (no NgModule required).
   */
  readonly component: Type<unknown>;
  /** Optional icon class or ligature shown in the tab strip. */
  readonly icon?: string;
  /** When false the tab cannot be closed by the user. Defaults to true. */
  readonly closable?: boolean;
}
