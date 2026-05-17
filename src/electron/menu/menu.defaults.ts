/**
 * Default menu entries for the native application menu.
 *
 * Defines the slot map of all built-in menu items, each with a unique ID
 * that can be referenced in MenuConfig.overrides.
 *
 * All entries are in Spanish (es-MX) per specification.
 */

import { MenuItemConstructorOptions } from 'electron';

/**
 * Record of default menu entries keyed by slot ID.
 * Each entry includes Electron MenuItemConstructorOptions.
 *
 * Note: `click` handlers are set at build time in menu.builder.ts based on context (isDev, activeTheme, etc.).
 */
export const DEFAULT_MENU_ENTRIES: Record<string, MenuItemConstructorOptions> = {
  // Top-level "File" menu
  file: {
    id: 'file',
    label: 'Archivo',
    submenu: [
      {
        id: 'file.exit',
        label: 'Salir',
        accelerator: 'CmdOrCtrl+Q',
      },
    ],
  },

  // Top-level "View" menu
  view: {
    id: 'view',
    label: 'Vista',
    submenu: [
      {
        id: 'view.devtools',
        label: 'Mostrar DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        visible: false, // Set at build time based on isDev
      },
      {
        type: 'separator',
      },
      {
        id: 'view.bottomPanel',
        label: 'Panel inferior',
        type: 'checkbox',
        checked: true, // Default visibility state
      },
      {
        id: 'view.secondaryPanel',
        label: 'Panel secundario',
        type: 'checkbox',
        checked: true, // Default visibility state
      },
    ],
  },

  // Top-level "Themes" menu
  themes: {
    id: 'themes',
    label: 'Temas',
    submenu: [
      {
        id: 'themes.dark',
        label: 'Oscuro',
        type: 'radio',
        checked: true, // Default theme is dark
      },
      {
        id: 'themes.light',
        label: 'Claro',
        type: 'radio',
        checked: false,
        enabled: false, // Visible but disabled until future spec
      },
    ],
  },
};

/**
 * Helper to get a default entry by slot ID.
 * Returns undefined if the slot does not exist.
 */
export function getDefaultEntry(slotId: string): MenuItemConstructorOptions | undefined {
  return DEFAULT_MENU_ENTRIES[slotId];
}
