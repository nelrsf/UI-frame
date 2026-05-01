/**
 * Public entry point for the core state module.
 *
 * Re-exports the root AppState type so that feature slices and selectors
 * can reference the application state shape from a single stable import path.
 */
export type { AppState } from './app.state';
export * from './session';
