import { createAction, props } from '@ngrx/store';

/**
 * Dispatched by CommandRegistryService after every command execution
 * (success or failure). Consumed by telemetry selectors for debugging,
 * auditing, and future cross-cutting concerns (remote logging, analytics).
 */
export const commandExecuted = createAction(
  '[Command Telemetry] Executed',
  props<{ commandId: string; success: boolean; timestamp: number; context?: string }>()
);
