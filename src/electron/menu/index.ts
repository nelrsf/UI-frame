/**
 * Public export surface for the Menu module.
 *
 * Import MenuBuilder, MenuManager and related types from this barrel:
 *   import { MenuBuilder, MenuManager, type IMenuConfig } from '../electron/menu';
 */

export { MenuBuilder } from './menu.builder';
export { MenuManager } from './menu.manager';
export type { IMenuConfig, IMenuEntry, MenuSlotId, PanelToggleTarget, IMenuBuildContext } from '../../contracts';
export { MENU_SLOT_IDS } from '../../contracts';
