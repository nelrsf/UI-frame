/**
 * IPC handlers for menu-related events from the main process.
 *
 * Registers handlers for theme changes and other menu-driven events
 * that the main process needs to coordinate with the renderer.
 *
 * This module is imported and called during main.ts initialization.
 */

import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../channels';
import { MenuManager } from '../../menu/menu.manager';

/**
 * Register all menu-related IPC handlers.
 */
export function registerMenuHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.MENU.UPDATE_PANEL_STATE, async (_event, payload: unknown): Promise<void> => {
    if (typeof payload === 'object' && payload !== null) {
      const { bottomPanelVisible, secondaryPanelVisible } = payload as { bottomPanelVisible?: boolean; secondaryPanelVisible?: boolean };

      const manager = MenuManager.getInstance();

      if (bottomPanelVisible !== undefined) {
        manager.updateBottomPanel(bottomPanelVisible);
      }
      if (secondaryPanelVisible !== undefined) {
        manager.updateSecondaryPanel(secondaryPanelVisible);
      }
    }
  });
}
