# Coding Conventions

## Code Style

### TypeScript Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing commas**: Used in multi-line objects and arrays
- **Type annotations**: Explicit types for function parameters and return values

### Angular Component Style

- **Standalone components**: All components are standalone (`standalone: true` in `@Component`)
- **File naming**: `component-name.component.ts`, `component-name.component.html`, `component-name.component.css`
- **Import order**:
  1. Angular/core imports
  2. Angular/common imports
  3. NgRx imports
  4. Local imports (core, shell, themes)

### Naming Conventions

- **Classes/Components/Services**: PascalCase (e.g., `CommandRegistryService`, `ShellManager`)
- **Interfaces**: PascalCase with `I` prefix for port interfaces (e.g., `IElectronApiPort`, `ICommandRegistryService`)
- **Variables/Functions**: camelCase (e.g., `sidebarVisible`, `toggleSidebar`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `PREFERENCES_SCHEMA_VERSION`, `SIDEBAR_WIDTH_DEFAULT`)
- **NgRx Actions**: camelCase with verb-noun pattern (e.g., `toggleSidebar`, `setSidebarWidth`)
- **NgRx Selectors**: `select*` prefix (e.g., `selectSidebarVisible`, `selectLayoutSnapshot`)

## Patterns

### Port and Adapter Pattern

- **Ports**: Interfaces in `src/app/core/application/ports/` defining boundaries
- **Adapters**: Implementations in `src/app/core/infrastructure/electron/adapters/`
- **Injection Tokens**: Use `InjectionToken` for port bindings (e.g., `ELECTRON_API_PORT`)

### NgRx State Management Pattern

- **Feature slices**: Organized by domain (session, layout, preferences, workspace, etc.)
- **File structure per feature**:
  - `*.actions.ts`: Action definitions
  - `*.reducer.ts`: Reducer implementation
  - `*.selectors.ts`: Selector functions
  - `*.effects.ts`: Effect implementations (if applicable)
  - `index.ts`: Feature export

### Error Handling Pattern

- **Command Registry**: Silent failure with warning logs, dispatches `commandExecuted` with `success: false`
- **Try-catch blocks**: Catch errors, log with `console.error`, ensure graceful degradation
- **No throw on execution**: Commands should always resolve, never throw unhandled exceptions

## Code Organization

### Layer Separation

1. **Core Application** (`src/app/core/application/`): Business logic, port interfaces
2. **Core Infrastructure** (`src/app/core/infrastructure/`): Implementations, adapters, persistence
3. **Core Services** (`src/app/core/services/`): Business services, state management utilities
4. **Shell/UI** (`src/app/shell/`): UI components, shell manager, mock UI

### Import Statements

- **Relative imports**: Used for local module imports
- **Absolute imports**: Not used; all imports are relative to the file location
- **NgRx imports**: Grouped together, sorted alphabetically

## Documentation

- **JSDoc comments**: Used for public APIs, interfaces, and complex functions
- **Inline comments**: Used for explaining non-obvious logic or workarounds
- **Deprecation notices**: `@deprecated` JSDoc tag used for deprecated APIs