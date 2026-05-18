/**
 * MenuBuilder - Constructs and customizes the native application menu.
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
*   overrides: { 'file.exit': { label: 'Exit' } },
   * });
   * const menu = builder.build({ activeTheme: 'dark', isDev: false });
   * Menu.setApplicationMenu(menu);
   * ```
   *
   * ## Customization Rules
   *
   * - `file.exit` cannot be hidden (attempts to set `visible: false` are silently ignored).
   * - `themes.light` is enabled in spec 007 - Light Theme Support.
   * - `view.devtools` is visible only when `isDev === true`.
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
import { IMenuConfig, IMenuBuildContext, AppTheme, THEME_PREFERENCE_KEY } from '../../contracts';
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
   * Sets the window reference used by MenuManager.
   * This does not build the menu; it only stores the reference for menu handlers.
   *
   * @param windowRef Minimal reference with a send method
   */
  setMainWindowRef(windowRef: { send: (channel: string, ...args: unknown[]) => void }): void {
    this.mainWindow = windowRef as unknown as BrowserWindow;
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
    performance.mark('menu.build.start');
    const template = this.buildTemplate(context);
    const menu = Menu.buildFromTemplate(template);
    performance.measure('menu.build', 'menu.build.start');
    return menu;
  }

  /**
   * Internal: Build the menu template.
   */
  private buildTemplate(context: IMenuBuildContext): MenuItemConstructorOptions[] {
    const topLevelMenus: MenuItemConstructorOptions[] = [
      this.buildFileMenu(context),
      this.buildViewMenu(context),
      this.buildThemesMenu(context),
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
  private buildFileMenu(context: IMenuBuildContext): MenuItemConstructorOptions {
    const exitEntry: MenuItemConstructorOptions = {
      id: 'file.exit',
      label: 'Salir',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        app.quit();
      },
    };

    // Apply any overrides to the Exit entry
    const exitOverride = this.config.overrides?.['file.exit'];
    if (exitOverride) {
      // Merge override but ensure visible: false is ignored (mandatory entry)
      const merged = { ...exitEntry, ...exitOverride };
      if (exitOverride.visible === false) {
        merged.visible = true; // Silently ignore hide attempt
      }
      Object.assign(exitEntry, merged);
    }

    const menu: MenuItemConstructorOptions = {
      label: 'Archivo',
      submenu: [exitEntry],
    };

    return menu;
  }

  /**
   * Build the "Vista" (View) menu with panel toggles and devtools.
   */
  private buildViewMenu(context: IMenuBuildContext): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = [];

    // DevTools entry (visible only in development)
    if (context.isDev) {
      submenu.push({
        id: 'view.devtools',
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
      id: 'view.bottomPanel',
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
      id: 'view.secondaryPanel',
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
    if (this.config.overrides?.['view.bottomPanel']) {
      const idx = submenu.findIndex((item) => item.id === 'view.bottomPanel');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['view.bottomPanel'] };
      }
    }
    if (this.config.overrides?.['view.secondaryPanel']) {
      const idx = submenu.findIndex((item) => item.id === 'view.secondaryPanel');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['view.secondaryPanel'] };
      }
    }
    if (this.config.overrides?.['view.devtools']) {
      const idx = submenu.findIndex((item) => item.id === 'view.devtools');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['view.devtools'] };
      }
    }

    return { label: 'Vista', submenu };
  }

  /**
   * Build the "Temas" (Themes) menu with dark/light radio options.
   */
  private buildThemesMenu(context: IMenuBuildContext): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = [
      {
        id: 'themes.dark',
        label: 'Oscuro',
        type: 'radio',
        checked: context.activeTheme === 'dark',
        click: () => {
          this.applyTheme('dark', context);
        },
      },
      {
        id: 'themes.light',
        label: 'Claro',
        type: 'radio',
        checked: context.activeTheme === 'light',
        enabled: true,
        click: () => {
          this.applyTheme('light', context);
        },
      },
    ];

    // Apply overrides to theme entries
    if (this.config.overrides?.['themes.dark']) {
      const idx = submenu.findIndex((item) => item.id === 'themes.dark');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['themes.dark'] };
      }
    }
    if (this.config.overrides?.['themes.light']) {
      const idx = submenu.findIndex((item) => item.id === 'themes.light');
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...this.config.overrides['themes.light'] };
      }
    }

    return { label: 'Temas', submenu };
  }

  /**
   * Internal: Apply a theme change (update nativeTheme, notify renderer).
   * Persistence is handled by the renderer via IPC → PreferencesAdapter → PreferenceStore.
   */
  private applyTheme(theme: AppTheme, context: IMenuBuildContext): void {
    // Set the native theme in the OS
    nativeTheme.themeSource = theme === 'dark' ? 'dark' : 'light';

    // Notify the renderer that the theme has changed
    // The renderer will persist the preference via the PreferencesAdapter IPC bridge
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(IPC_CHANNELS.MENU.THEME_CHANGED, { theme });
    }

    // Rebuild and re-apply the menu with the new theme context
    const updatedMenu = this.build({ ...context, activeTheme: theme });
    Menu.setApplicationMenu(updatedMenu);
  }
}
