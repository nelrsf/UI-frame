/**
 * MenuBuilder — Constructs and customizes the native application menu.
 *
 * This class is the primary entry point for integrators who need to customize
 * menu entries, labels, or callbacks. The default Spanish menu is applied
 * automatically; overrides and extra entries are merged at build time.
 *
 * ## Usage
 *
 * ```ts
 * import { MenuBuilder } from '../menu';
 *
 * // In main.ts at startup:
 * const builder = new MenuBuilder({
 *   overrides: { 'archivo.salir': { label: 'Exit' } },
 * });
 * const menu = builder.build({ activeTheme: 'dark', isDev: false });
 * Menu.setApplicationMenu(menu);
 * ```
 *
 * ## Customization Rules
 *
 * - `archivo.salir` cannot be hidden (attempts to set `visible: false` are silently ignored).
 * - `temas.claro` is always disabled until a future spec enables light theme support.
 * - `vista.devtools` is visible only when `isDev === true`.
 * - Extra entries are appended after the built-in entries.
 */

import {
  app,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  nativeTheme,
  BrowserWindow,
} from 'electron';
import { IMenuConfig, IMenuBuildContext, AppTheme } from '../../contracts';
import { IPC_CHANNELS } from '../ipc/channels';
import { DEFAULT_MENU_ENTRIES } from './menu.defaults';

/**
 * Builds a native Electron menu from a configuration object.
 *
 * Applies overrides to the built-in default menu and handles runtime
 * context like theme and development mode.
 */
export class MenuBuilder {
  private config: IMenuConfig;
  private mainWindow?: BrowserWindow;

  /**
   * @param config Optional customization configuration. If omitted, the default Spanish menu is used.
   */
  constructor(config?: IMenuConfig) {
    this.config = config || {};
  }

  /**
   * Set the main window reference so menu click handlers can send IPC messages to the renderer.
   *
   * This is called internally during initialization in main.ts.
   */
  setMainWindow(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
  }

  /**
   * Build the native menu from configuration and context.
   *
   * Applies all overrides, injects runtime context (theme, isDev), and wires click handlers.
   *
   * @param context Runtime context including active theme and development mode flag.
   * @returns An Electron Menu object ready to pass to Menu.setApplicationMenu().
   */
  build(context: IMenuBuildContext): Menu {
    const template = this.buildTemplate(context);
    return Menu.buildFromTemplate(template);
  }

  /**
   * Internal: Build the menu template.
   */
  private buildTemplate(context: IMenuBuildContext): MenuItemConstructorOptions[] {
    const topLevelMenus: MenuItemConstructorOptions[] = [
      this.buildArchivoMenu(context),
      this.buildVistaMenu(context),
      this.buildTemasMenu(context),
    ];

    // Append any extra entries supplied by the integrator
    if (this.config.extraEntries) {
      topLevelMenus.push(...this.config.extraEntries);
    }

    return topLevelMenus;
  }

  /**
   * Build the "Archivo" (File) menu.
   */
  private buildArchivoMenu(context: IMenuBuildContext): MenuItemConstructorOptions {
    const salirEntry: MenuItemConstructorOptions = {
      id: 'archivo.salir',
      label: 'Salir',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        app.quit();
      },
    };

    // Apply any overrides to the Salir entry
    const salirOverride = this.config.overrides?.['archivo.salir'];
    if (salirOverride) {
      // Merge override but ensure visible: false is ignored (mandatory entry)
      const merged = { ...salirEntry, ...salirOverride };
      if (salirOverride.visible === false) {
        merged.visible = true; // Silently ignore hide attempt
      }
      Object.assign(salirEntry, merged);
    }

    const menu: MenuItemConstructorOptions = {
      label: 'Archivo',
      submenu: [salirEntry],
    };

    return menu;
  }

  /**
   * Build the "Vista" (View) menu with panel toggles and devtools.
   */
  private buildVistaMenu(context: IMenuBuildContext): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = [];

    // DevTools entry (visible only in development)
    if (context.isDev) {
      submenu.push({
        id: 'vista.devtools',
        label: 'Mostrar DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => {
          this.mainWindow?.webContents.openDevTools();
        },
      });
      submenu.push({ type: 'separator' });
    }

    // Panel toggle entries
    submenu.push({
      id: 'vista.bottomPanel',
      label: 'Panel inferior',
      type: 'checkbox',
      checked: context.bottomPanelVisible ?? true,
      click: () => {
        if (this.mainWindow) {
          this.mainWindow.webContents.send(IPC_CHANNELS.MENU.TOGGLE_BOTTOM_PANEL);
        }
      },
    });

    submenu.push({
      id: 'vista.secondaryPanel',
      label: 'Panel secundario',
      type: 'checkbox',
      checked: context.secondaryPanelVisible ?? true,
      click: () => {
        if (this.mainWindow) {
          this.mainWindow.webContents.send(IPC_CHANNELS.MENU.TOGGLE_SECONDARY_PANEL);
        }
      },
    });

    // Apply overrides to Vista menu entries
    if (this.config.overrides?.['vista.bottomPanel']) {
      const idx = submenu.findIndex((item) => item.id === 'vista.bottomPanel');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['vista.bottomPanel'] };
      }
    }
    if (this.config.overrides?.['vista.secondaryPanel']) {
      const idx = submenu.findIndex((item) => item.id === 'vista.secondaryPanel');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['vista.secondaryPanel'] };
      }
    }
    if (this.config.overrides?.['vista.devtools']) {
      const idx = submenu.findIndex((item) => item.id === 'vista.devtools');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['vista.devtools'] };
      }
    }

    return { label: 'Vista', submenu };
  }

  /**
   * Build the "Temas" (Themes) menu with dark/light radio options.
   */
  private buildTemasMenu(context: IMenuBuildContext): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = [
      {
        id: 'temas.oscuro',
        label: 'Oscuro',
        type: 'radio',
        checked: context.activeTheme === 'dark',
        click: () => {
          this.applyTheme('dark', context);
        },
      },
      {
        id: 'temas.claro',
        label: 'Claro',
        type: 'radio',
        checked: context.activeTheme === 'light',
        enabled: false, // Future: enable when light theme spec ships
        click: () => {
          // Stub: do nothing until light theme is enabled
        },
      },
    ];

    // Apply overrides to theme entries
    if (this.config.overrides?.['temas.oscuro']) {
      const idx = submenu.findIndex((item) => item.id === 'temas.oscuro');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['temas.oscuro'] };
      }
    }
    if (this.config.overrides?.['temas.claro']) {
      const idx = submenu.findIndex((item) => item.id === 'temas.claro');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['temas.claro'] };
      }
    }

    return { label: 'Temas', submenu };
  }

  /**
   * Internal: Apply a theme change (update nativeTheme, persist, notify renderer).
   */
  private applyTheme(theme: AppTheme, context: IMenuBuildContext): void {
    // Set the native theme in the OS
    nativeTheme.themeSource = theme === 'dark' ? 'dark' : 'light';

    // Notify the renderer that the theme has changed
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_CHANNELS.MENU.THEME_CHANGED, { theme });
    }

    // Rebuild and re-apply the menu with the new theme context
    const updatedMenu = this.build({ ...context, activeTheme: theme });
    Menu.setApplicationMenu(updatedMenu);
  }
}
