/**
 * Public contract for registering an entry in the shell's activity sidebar.
 *
 * Implementations are registered with ShellManager.addSidebarEntry() and
 * appear in the sidebar activity bar without the shell knowing the concrete
 * domain type. The shell translates this contract to its internal SidebarItem
 * DTO.
 *
 * @example
 * const reportsEntry: ISidebarEntry = {
 *   id: 'reports-nav',
 *   label: 'Reports',
 *   icon: 'description',
 *   tooltip: 'Open Reports module',
 * };
 * shellManager.addSidebarEntry(reportsEntry);
 */
export interface ISidebarEntry {
  /** Stable unique identifier. Duplicate ids are silently ignored. */
  readonly id: string;
  /** Accessible label for the sidebar item. */
  readonly label: string;
  /**
   * Icon identifier (CSS class name or Material ligature).
   * Required because the sidebar activity bar is icon-first.
   */
  readonly icon: string;
  /** Optional tooltip shown on hover or keyboard focus. */
  readonly tooltip?: string;
}
