/**
 * Public export surface for the Menu module.
 *
 * Import MenuBuilder and related types from this barrel:
 *   import { MenuBuilder, type IMenuConfig } from '../electron/menu';
 */

export { MenuBuilder } from './menu.builder';
export type { IMenuConfig, IMenuEntry, MenuSlotId, PanelToggleTarget, IMenuBuildContext } from '../../contracts';
export { MENU_SLOT_IDS } from '../../contracts';
