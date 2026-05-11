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
  // Top-level "Archivo" menu
  archivo: {
    id: 'archivo',
    label: 'Archivo',
    submenu: [
      {
        id: 'archivo.salir',
        label: 'Salir',
        accelerator: 'CmdOrCtrl+Q',
      },
    ],
  },

  // Top-level "Vista" menu
  vista: {
    id: 'vista',
    label: 'Vista',
    submenu: [
      {
        id: 'vista.devtools',
        label: 'Mostrar DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        visible: false, // Set at build time based on isDev
      },
      {
        type: 'separator',
      },
      {
        id: 'vista.bottomPanel',
        label: 'Panel inferior',
        type: 'checkbox',
        checked: true, // Default visibility state
      },
      {
        id: 'vista.secondaryPanel',
        label: 'Panel secundario',
        type: 'checkbox',
        checked: true, // Default visibility state
      },
    ],
  },

  // Top-level "Temas" menu
  temas: {
    id: 'temas',
    label: 'Temas',
    submenu: [
      {
        id: 'temas.oscuro',
        label: 'Oscuro',
        type: 'radio',
        checked: true, // Default theme is dark
      },
      {
        id: 'temas.claro',
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
