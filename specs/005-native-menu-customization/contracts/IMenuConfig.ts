import { IMenuEntry, MenuSlotId } from './IMenuEntry';

/**
 * Configuration object accepted by `MenuBuilder`.
 *
 * Providing a `MenuConfig` is optional. Omitting it produces the default
 * Spanish shell menu. Using `overrides` lets integrators change specific
 * entries without rebuilding the full template.
 *
 * ## Examples
 *
 * ### Override a single label
 * ```ts
 * const config: IMenuConfig = {
 *   overrides: {
 *     'file.exit': { label: 'Exit' },
 *   },
 * };
 * ```
 *
 * ### Add a custom submenu entry
 * ```ts
 * const config: IMenuConfig = {
 *   extraEntries: [
 *     {
 *       id: 'ayuda',
 *       label: 'Ayuda',
 *       type: 'submenu',
 *       submenu: [
 *         { id: 'ayuda.acerca', label: 'Acerca de...', type: 'normal', click: () => showAbout() },
 *       ],
 *     },
 *   ],
 * };
 * ```
 *
 * ### Disable a built-in entry
 * ```ts
 * const config: IMenuConfig = {
 *   overrides: { 'view.devtools': { visible: false } },
 * };
 * ```
 */
export interface IMenuConfig {
  /**
   * Shallow-merged overrides applied to matching entries by `IMenuEntry.id`.
   *
   * Only the fields you specify are changed; all other fields keep their
   * default values. You cannot add new entries here - use `extraEntries`.
   */
  overrides?: Partial<Record<MenuSlotId | string, Partial<Omit<IMenuEntry, 'id'>>>>;

  /**
   * Additional top-level entries appended after the built-in defaults.
   * Each entry must have a unique `id` not used by any built-in slot.
   */
  extraEntries?: IMenuEntry[];
}
