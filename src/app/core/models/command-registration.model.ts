/**
 * Minimal metadata for a command that can be registered, listed, and executed.
 * Serves as the single descriptor consumed by menu, toolbar, and shortcut entry points.
 *
 * Shortcut conventions:
 * - Use the canonical `Mod` token for the primary modifier key.
 *   `Mod` is resolved to `Ctrl` on Windows/Linux and `Cmd` on macOS at render time
 *   by `ShellShortcutsService`.
 * - Provide `shortcutMac` only when the macOS binding must differ from the
 *   platform-normalized `shortcut` (e.g. to avoid an OS-reserved key combination).
 */
export interface CommandRegistration {
  /** Unique identifier used to look up and execute the command. */
  id: string;
  /** Human-readable label for menus, toolbars, and accessibility. */
  label: string;
  /**
   * Optional canonical keyboard shortcut string using the `Mod` token
   * (e.g. `'Mod+Shift+P'`).  `Mod` is resolved per-platform by
   * `ShellShortcutsService.normalize()`.
   */
  shortcut?: string;
  /**
   * Optional macOS-specific shortcut override.  When present this value
   * is used instead of `shortcut` on macOS, allowing platform-specific
   * bindings without separate command registrations.
   */
  shortcutMac?: string;
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
