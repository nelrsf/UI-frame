import { DockZone } from '../../core/models/dock-zone-assignment.model';
import { ICloseable, IDraggable, IPinnable, WithCloseable, WithDraggable, WithPinnable } from '../models/tab-item.model';
import { ShellTab } from './ShellTab';

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
  * const weatherTab: CentralRegionTab = {
  * id: 'weather-main',
  * label: 'Weather',
  * icon: 'cloud',
  * component: WeatherMainComponent,
  * };
 * shellManager.addTab(weatherTab);
 */
export class CentralRegionTab extends ShellTab implements WithCloseable, WithDraggable, WithPinnable {
  closeable?: ICloseable;
  draggable?: IDraggable;
  pinnable?: IPinnable;
}
