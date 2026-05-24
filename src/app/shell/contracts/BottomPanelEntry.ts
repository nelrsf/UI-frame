import { ShellTab } from './ShellTab';

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
export class BottomPanelEntry extends ShellTab {}

