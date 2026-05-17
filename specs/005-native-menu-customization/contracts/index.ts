// Public contract surface for Native Menu Customization (spec 005).
//
// Import from this barrel in both main-process and renderer code:
//   import { IMenuConfig, IMenuEntry, AppTheme } from '../contracts';

export { AppTheme, DEFAULT_THEME, THEME_PREFERENCE_KEY, IThemeChangedPayload } from './IThemePreference';
export { IMenuEntry, IMenuBuildContext, PanelToggleTarget, MENU_SLOT_IDS } from './IMenuEntry';
export type { MenuSlotId } from './IMenuEntry';
export { IMenuConfig } from './IMenuConfig';
