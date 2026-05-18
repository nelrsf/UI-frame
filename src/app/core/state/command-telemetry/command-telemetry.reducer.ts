import { createReducer, on } from '@ngrx/store';
import { commandExecuted } from './command-telemetry.actions';

/** Maximum number of execution records retained in the telemetry state. */
export const COMMAND_TELEMETRY_MAX_HISTORY = 100;

/** A single command execution telemetry record. */
export interface CommandExecutionRecord {
  readonly commandId: string;
  readonly success: boolean;
  readonly timestamp: number;
  readonly context?: string;
}

/**
 * NgRx state slice for command execution telemetry.
 *
 * Append-only with bounded FIFO eviction to prevent unbounded memory growth.
 * This slice is NOT persisted to workspace sessions (telemetry is transient).
 */
export interface CommandTelemetryState {
  readonly executions: CommandExecutionRecord[];
  readonly maxHistory: number;
}

export const initialCommandTelemetryState: CommandTelemetryState = {
  executions: [],
  maxHistory: COMMAND_TELEMETRY_MAX_HISTORY,
};

export const commandTelemetryReducer = createReducer(
  initialCommandTelemetryState,
  on(commandExecuted, (state, { commandId, success, timestamp, context }) => {
    const record: CommandExecutionRecord = { commandId, success, timestamp, context };
    const executions = [...state.executions, record];

    // FIFO eviction: trim to maxHistory from the oldest end.
    if (executions.length > state.maxHistory) {
      return {
        ...state,
        executions: executions.slice(executions.length - state.maxHistory),
      };
    }

    return { ...state, executions };
  })
);
