import { Menu, BrowserWindow } from 'electron';
import { MenuBuilder } from './menu.builder';
import type { IMenuConfig, IMenuBuildContext } from '../../contracts';

/**
 * Manager for targeted menu updates.
 * Allows individual items to be updated without rebuilding the full menu.
 *
 * Usage:
 * - Initialize with setMainWindow() during startup
 * - Use updateBottomPanel() / updateSecondaryPanel() for targeted updates
 * - Use rebuildFull() only for initialization or major changes
 *
 * Supports injected configuration via setConfig() for OCP compliance.
 */
export class MenuManager {
  private static instance: MenuManager | null = null;
  private mainWindowRef?: BrowserWindow;
  private bottomPanelVisible = true;
  private secondaryPanelVisible = true;
  private config: IMenuConfig = {};

  private constructor() {}

  static getInstance(): MenuManager {
    if (!MenuManager.instance) {
      MenuManager.instance = new MenuManager();
    }
    return MenuManager.instance;
  }

  /**
   * Sets the menu configuration for OCP compliance.
   * Allows injecting custom configuration without modifying constructor.
   */
  setConfig(config: IMenuConfig): void {
    this.config = config;
  }

  /**
   * Initializes the manager with the main window reference.
   * This does not build the menu; it only stores the reference.
   */
  setMainWindow(windowRef: BrowserWindow): void {
    this.mainWindowRef = windowRef;
  }

  /**
   * Updates the bottom panel state.
   * Complexity: O(1) - updates one item without rebuilding the full menu.
   */
  updateBottomPanel(visible: boolean): void {
    this.bottomPanelVisible = visible;
    this.updateCheckbox('view.bottomPanel', visible);
  }

  /**
   * Updates the secondary panel state.
   * Complexity: O(1) - updates one item without rebuilding the full menu.
   */
  updateSecondaryPanel(visible: boolean): void {
    this.secondaryPanelVisible = visible;
    this.updateCheckbox('view.secondaryPanel', visible);
  }

  /**
   * Gets the current panel state.
   */
  getPanelState(): { bottomPanelVisible: boolean; secondaryPanelVisible: boolean } {
    return {
      bottomPanelVisible: this.bottomPanelVisible,
      secondaryPanelVisible: this.secondaryPanelVisible,
    };
  }

  /**
   * Rebuilds the full menu for initialization or major changes.
   * Uses injected configuration if available.
   */
  rebuildFull(context: IMenuBuildContext): void {
    this.bottomPanelVisible = context.bottomPanelVisible ?? true;
    this.secondaryPanelVisible = context.secondaryPanelVisible ?? true;

    const builder = new MenuBuilder(this.config);
    builder.setMainWindow(this.mainWindowRef!);
    const menu = builder.build(context);
    Menu.setApplicationMenu(menu);
  }

  /**
   * Updates a specific checkbox by ID.
   * Complexity: O(1) - looks up one item and updates it.
   */
  private updateCheckbox(itemId: string, checked: boolean): void {
    const menu = Menu.getApplicationMenu();
    if (!menu) return;

    try {
      const item = menu.getMenuItemById(itemId);
      if (item && 'checked' in item && typeof item.checked === 'boolean') {
        item.checked = checked;
      }
    } catch {
      // Silent fail if item not found
    }
  }
}
