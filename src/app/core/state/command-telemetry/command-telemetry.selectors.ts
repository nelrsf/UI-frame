import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CommandTelemetryState, CommandExecutionRecord } from './command-telemetry.reducer';

export const selectCommandTelemetryState = createFeatureSelector<CommandTelemetryState>('commandTelemetry');

/**
 * Returns all execution records in chronological order (oldest first).
 */
export const selectAllExecutions = createSelector(
  selectCommandTelemetryState,
  (state) => state?.executions ?? []
);

/**
 * Returns the N most recent execution records (newest first).
 * @param count Number of records to return (default: 10).
 */
export const selectRecentExecutions = (count = 10) =>
  createSelector(selectAllExecutions, (executions) =>
    executions.slice(-count).reverse()
  );

/**
 * Returns the latest execution record for a specific command ID, or undefined
 * if the command has never been executed.
 */
export const selectLastExecution = (commandId: string) =>
  createSelector(selectAllExecutions, (executions) => {
    for (let i = executions.length - 1; i >= 0; i--) {
      if (executions[i].commandId === commandId) {
        return executions[i];
      }
    }
    return undefined;
  });
