/**
 * @internal — fake data module for UI Frame validation only. Not for production use.
 *
 * Exports mock models and fixtures used to populate the shell via ShellManager.
 * Mock components and initializers are internal to this module and loaded
 * automatically via APP_INITIALIZER in app.config.ts.
 */
export * from './models/index';
export * from './fixtures/index';
