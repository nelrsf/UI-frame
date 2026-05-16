import { Menu, BrowserWindow } from 'electron';
import { MenuBuilder } from './menu.builder';
import type { IMenuBuildContext } from '../../contracts';

/**
 * Gestor de actualizaciones parciales del menú.
 * Permite actualizar items individuales sin reconstruir todo el menú.
 * 
 * Uso:
 * - Inicializar con setMainWindow() durante el startup
 * - Usar updateBottomPanel() / updateSecondaryPanel() para cambios parciales
 * - Usar rebuildFull() solo para inicialización o cambios mayores
 */
export class MenuManager {
  private static instance: MenuManager | null = null;
  private mainWindowRef?: BrowserWindow;
  private bottomPanelVisible = true;
  private secondaryPanelVisible = true;

  private constructor() {}

  static getInstance(): MenuManager {
    if (!MenuManager.instance) {
      MenuManager.instance = new MenuManager();
    }
    return MenuManager.instance;
  }

  /**
   * Inicializa el gestor con referencia a la ventana principal.
   * No construye el menú, solo guarda la referencia.
   */
  setMainWindow(windowRef: BrowserWindow): void {
    this.mainWindowRef = windowRef;
  }

  /**
   * Actualiza el estado del panel inferior.
   * Complejidad: O(1) - solo actualiza un item, no reconstruye todo.
   */
  updateBottomPanel(visible: boolean): void {
    this.bottomPanelVisible = visible;
    this.updateCheckbox('view.bottomPanel', visible);
  }

  /**
   * Actualiza el estado del panel secundario.
   * Complejidad: O(1) - solo actualiza un item, no reconstruye todo.
   */
  updateSecondaryPanel(visible: boolean): void {
    this.secondaryPanelVisible = visible;
    this.updateCheckbox('view.secondaryPanel', visible);
  }

  /**
   * Obtiene el estado actual de los paneles.
   */
  getPanelState(): { bottomPanelVisible: boolean; secondaryPanelVisible: boolean } {
    return {
      bottomPanelVisible: this.bottomPanelVisible,
      secondaryPanelVisible: this.secondaryPanelVisible,
    };
  }

  /**
   * Reconstruye el menú completo (para cambios mayores o inicialización).
   */
  rebuildFull(context: IMenuBuildContext): void {
    this.bottomPanelVisible = context.bottomPanelVisible ?? true;
    this.secondaryPanelVisible = context.secondaryPanelVisible ?? true;
    
    const builder = new MenuBuilder();
    builder.setMainWindow(this.mainWindowRef!);
    const menu = builder.build(context);
    Menu.setApplicationMenu(menu);
  }

  /**
   * Actualiza un checkbox específico por su ID.
   * Complejidad: O(1) - busca por ID y actualiza.
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