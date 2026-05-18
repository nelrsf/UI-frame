import { Injectable, isDevMode } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommandRegistration, ICommandRegistryService } from '../models/command-registration.model';
import { commandExecuted } from '../state/command-telemetry';

/**
 * Central registry for shell commands.
 *
 * Responsibilities:
 * - `register`: stores a command by id (overwrites duplicate ids).
 * - `execute`: invokes a command handler asynchronously; always resolves.
 *   On completion (success or failure) dispatches a `commandExecuted` NgRx
 *   action for auditing.
 * - `list`: returns an immutable snapshot of all registered commands.
 */
@Injectable({ providedIn: 'root' })
export class CommandRegistryService implements ICommandRegistryService {
  private readonly _registry = new Map<string, CommandRegistration>();

  constructor(private readonly store: Store) {}

  register(command: CommandRegistration): void {
    this._registry.set(command.id, command);
  }

  async execute(id: string): Promise<void> {
    const command = this._registry.get(id);

    const timestamp = Date.now();

    if (!command) {
      console.warn('[CommandRegistry] Unknown command id:', id);
      this.store.dispatch(commandExecuted({ commandId: id, success: false, timestamp }));
      return;
    }

    let success = false;
    try {
      await command.execute();
      success = true;
    } catch (err) {
      console.error('[CommandRegistry] Command execution failed:', id, err);
    }

    this.store.dispatch(commandExecuted({ commandId: id, success, timestamp, context: command.context }));
  }

  list(): ReadonlyArray<CommandRegistration> {
    return Array.from(this._registry.values());
  }

  getById(id: string): CommandRegistration | undefined {
    return this._registry.get(id);
  }
}
