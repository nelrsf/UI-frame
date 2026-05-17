import { AppTheme } from './IThemePreference';

/**
 * A single item in the native application menu.
 *
 * Maps to Electron `MenuItemConstructorOptions` but uses a typed contract so
 * integrators work with the public surface rather than Electron internals.
 */
export interface IMenuEntry {
  /**
   * Unique slot identifier.
   *
   * Used as the key in `IMenuConfig.overrides` to target this entry.
   * Dot-notation convention: `'<topMenu>.<item>'` (e.g., `'file.exit'`).
   */
  readonly id: string;

  /** Display text shown to the user. */
  label: string;

  /** Electron menu item type. */
  type: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';

  /**
   * Whether the item is interactive. Defaults to `true`.
   * Set to `false` to render greyed-out without hiding.
   */
  enabled?: boolean;

  /**
   * Whether the item appears in the menu. Defaults to `true`.
   * Set to `false` to suppress the entry entirely.
   */
  visible?: boolean;

  /**
   * `true` when the item represents the currently active state.
   * Meaningful for `checkbox` and `radio` types only.
   */
  checked?: boolean;

  /**
   * Optional keyboard accelerator in Electron format (e.g., `'CmdOrCtrl+Q'`).
   */
  accelerator?: string;

  /**
   * Callback invoked when the user activates this entry.
   * Ignored for `separator` and `submenu` types.
   */
  click?: () => void;

  /**
   * Child entries - required when `type === 'submenu'`, ignored otherwise.
   */
  submenu?: IMenuEntry[];
}

/**
 * Identifies the shell panel that a menu toggle action targets.
 * Used as the payload of `MENU.TOGGLE_BOTTOM_PANEL` / `MENU.TOGGLE_SECONDARY_PANEL`.
 */
export type PanelToggleTarget = 'bottomPanel' | 'secondaryPanel';

/**
 * Built-in slot IDs for the default menu entries.
 * Use these as keys in `IMenuConfig.overrides`.
 */
export const MENU_SLOT_IDS = {
  FILE: 'file',
  FILE_EXIT: 'file.exit',
  VIEW: 'view',
  VIEW_DEVTOOLS: 'view.devtools',
  VIEW_BOTTOM_PANEL: 'view.bottomPanel',
  VIEW_SECONDARY_PANEL: 'view.secondaryPanel',
  THEMES: 'themes',
  THEMES_DARK: 'themes.dark',
  THEMES_LIGHT: 'themes.light',
} as const;

export type MenuSlotId = (typeof MENU_SLOT_IDS)[keyof typeof MENU_SLOT_IDS];

/**
 * Context injected by the MenuBuilder at build time.
 * Not part of the config - resolved automatically from the runtime environment.
 */
export interface IMenuBuildContext {
  readonly activeTheme: AppTheme;
  readonly isDev: boolean;
  /** Whether the bottom panel is currently visible (for checkbox checked state). */
  readonly bottomPanelVisible?: boolean;
  /** Whether the secondary panel is currently visible (for checkbox checked state). */
  readonly secondaryPanelVisible?: boolean;
}
