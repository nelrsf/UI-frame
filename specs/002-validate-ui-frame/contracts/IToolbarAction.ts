/**
 * Public contract for registering an action button in the shell toolbar.
 *
 * Implementations are registered with ShellManager.addToolbarAction().
 * ShellManager automatically registers the handler in CommandRegistry with
 * commandId = 'shell.action.' + id, so ToolbarComponent can invoke it without
 * any knowledge of the domain handler function.
 *
 * Exception safety: if the handler throws, CommandRegistryService catches the
 * error, logs it, and emits a 'command.executed.v1' failure event. The shell
 * will not crash.
 *
 * @example
 * const saveAction: IToolbarAction = {
 *   id: 'stock-refresh',
 *   label: 'Refresh',
 *   icon: 'refresh',
 *   handler: () => stockService.refresh(),
 *   tooltip: 'Refresh stock data',
 * };
 * shellManager.addToolbarAction(saveAction);
 */
export interface IToolbarAction {
  /** Stable unique identifier. Duplicate ids are silently ignored. */
  readonly id: string;
  /** Text label shown on the toolbar button. */
  readonly label: string;
  /** Icon identifier (CSS class or ligature). */
  readonly icon: string;
  /**
   * Function invoked when the toolbar button is clicked.
   * ShellManager registers this as a CommandRegistry command automatically.
   * The handler should be synchronous or return void; async handlers are
   * supported by CommandRegistry but exceptions must be handled internally.
   */
  readonly handler: () => void;
  /** Optional tooltip shown on hover or keyboard focus. */
  readonly tooltip?: string;
}
