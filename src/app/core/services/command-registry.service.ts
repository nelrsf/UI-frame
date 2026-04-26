import { Injectable } from '@angular/core';
import { EventBusService } from './event-bus.service';
import { CommandRegistration, ICommandRegistryService } from '../models/command-registration.model';

/**
 * Central registry for shell commands.
 *
 * Responsibilities:
 * - `register`: stores a command by id (overwrites duplicate ids).
 * - `execute`: invokes a command handler asynchronously; always resolves.
 *   On completion (success or failure) emits a `command.executed.v1` event
 *   via EventBus for auditing.
 * - `list`: returns an immutable snapshot of all registered commands.
 */
@Injectable({ providedIn: 'root' })
export class CommandRegistryService implements ICommandRegistryService {
  private readonly _registry = new Map<string, CommandRegistration>();

  constructor(private readonly eventBus: EventBusService) {}

  register(command: CommandRegistration): void {
    this._registry.set(command.id, command);
  }

  async execute(id: string): Promise<void> {
    const command = this._registry.get(id);

    const timestamp = Date.now();

    if (!command) {
      console.warn('[CommandRegistry] Unknown command id:', id);
      this.eventBus.emit(
        'command.executed.v1',
        { commandId: id, success: false, timestamp },
        'command-registry'
      );
      return;
    }

    let success = false;
    try {
      await command.execute();
      success = true;
    } catch (err) {
      console.error('[CommandRegistry] Command execution failed:', id, err);
    }

    this.eventBus.emit(
      'command.executed.v1',
      { commandId: id, success, timestamp, context: command.context },
      'command-registry'
    );
  }

  list(): ReadonlyArray<CommandRegistration> {
    return Array.from(this._registry.values());
  }
}
