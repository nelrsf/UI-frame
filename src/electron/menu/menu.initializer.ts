import { BrowserWindow } from 'electron';
import { MenuManager } from './menu.manager';
import { IMenuConfig, AppTheme } from '../../contracts';

export class MenuInitializer {
  private config: IMenuConfig;

  constructor(config?: IMenuConfig) {
    this.config = config || {};
  }

  initialize(window: BrowserWindow, theme: AppTheme, isDev: boolean): void {
    const manager = MenuManager.getInstance();
    manager.setConfig(this.config);
    manager.setMainWindow(window);
    manager.rebuildFull({
      activeTheme: theme,
      isDev,
      bottomPanelVisible: true,
      secondaryPanelVisible: true,
    });
  }

  getConfig(): IMenuConfig {
    return this.config;
  }
}