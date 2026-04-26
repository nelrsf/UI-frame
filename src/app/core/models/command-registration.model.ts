/**
 * Minimal metadata for a command that can be registered, listed, and executed.
 * Serves as the single descriptor consumed by menu, toolbar, and shortcut entry points.
 */
export interface CommandRegistration {
  /** Unique identifier used to look up and execute the command. */
  id: string;
  /** Human-readable label for menus, toolbars, and accessibility. */
  label: string;
  /** Optional keyboard shortcut string (e.g. 'Ctrl+Shift+P'). */
  shortcut?: string;
  /** Optional context scope that restricts when the command is active. */
  context?: string;
  /** Optional icon identifier or ligature name for toolbar and menu rendering. */
  icon?: string;
  /** Optional prose description used as a tooltip or for accessibility hints. */
  description?: string;
  /** Optional category for grouping commands in palettes and menus. */
  category?: string;
  /** The handler to invoke when the command is executed. */
  execute: () => void | Promise<void>;
}

export interface ICommandRegistryService {
  /** Registers a command, overwriting any existing registration with the same id. */
  register(command: CommandRegistration): void;
  /**
   * Executes the command identified by `id`.
   * Resolves when the handler completes (or is not found).
   * Never rejects — errors are caught, logged, and audited via EventBus.
   */
  execute(id: string): Promise<void>;
  /** Returns an immutable snapshot of all registered commands. */
  list(): ReadonlyArray<CommandRegistration>;
  /** Returns the registration for the given `id`, or `undefined` if not found. */
  getById(id: string): CommandRegistration | undefined;
}
