/**
 * Public contract surface for the menu and theme modules.
 *
 * Import from this barrel in both main-process and renderer code:
 *   import { IMenuConfig, MenuBuilder, AppTheme } from '../contracts';
 */

export type { AppTheme, IThemeChangedPayload } from './theme';
export { DEFAULT_THEME, THEME_PREFERENCE_KEY } from './theme';
export { THEME_METADATA } from './theme-metadata';

export type { IMenuEntry, MenuSlotId, PanelToggleTarget, IMenuBuildContext, IMenuConfig } from './menu';
export { MENU_SLOT_IDS } from './menu';
