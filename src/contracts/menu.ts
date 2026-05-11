/**
 * Menu entry and configuration contracts.
 */

import { MenuItemConstructorOptions } from 'electron';
import { AppTheme } from './theme';

/**
 * A single item in the native application menu.
 *
 * Maps to Electron `MenuItemConstructorOptions` but uses a typed contract so
 * integrators work with the public surface rather than Electron internals.
 */
export interface IMenuEntry extends MenuItemConstructorOptions {
  /**
   * Unique slot identifier.
   *
   * Used as the key in `IMenuConfig.overrides` to target this entry.
   * Dot-notation convention: `'<topMenu>.<item>'` (e.g., `'archivo.salir'`).
   */
  readonly id: string;
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
  ARCHIVO: 'archivo',
  ARCHIVO_SALIR: 'archivo.salir',
  VISTA: 'vista',
  VISTA_DEVTOOLS: 'vista.devtools',
  VISTA_BOTTOM_PANEL: 'vista.bottomPanel',
  VISTA_SECONDARY_PANEL: 'vista.secondaryPanel',
  TEMAS: 'temas',
  TEMAS_OSCURO: 'temas.oscuro',
  TEMAS_CLARO: 'temas.claro',
} as const;

export type MenuSlotId = (typeof MENU_SLOT_IDS)[keyof typeof MENU_SLOT_IDS];

/**
 * Context injected by the MenuBuilder at build time.
 * Not part of the config — resolved automatically from the runtime environment.
 */
export interface IMenuBuildContext {
  readonly activeTheme: AppTheme;
  readonly isDev: boolean;
  /** Whether the bottom panel is currently visible (for checkbox checked state). */
  readonly bottomPanelVisible?: boolean;
  /** Whether the secondary panel is currently visible (for checkbox checked state). */
  readonly secondaryPanelVisible?: boolean;
}

/**
 * Configuration object accepted by `MenuBuilder`.
 *
 * Providing a `MenuConfig` is optional. Omitting it produces the default
 * Spanish shell menu. Using `overrides` lets integrators change specific
 * entries without rebuilding the full template.
 */
export interface IMenuConfig {
  /**
   * Shallow-merged overrides applied to matching entries by `IMenuEntry.id`.
   *
   * Only the fields you specify are changed; all other fields keep their
   * default values. You cannot add new entries here — use `extraEntries`.
   */
  readonly overrides?: Record<string, Partial<MenuItemConstructorOptions>>;

  /**
   * Additional top-level menu entries to append after the built-in defaults.
   *
   * Use this to add custom menus (e.g., 'Ayuda', 'Herramientas') without
   * modifying the core menu structure.
   */
  readonly extraEntries?: MenuItemConstructorOptions[];
}
