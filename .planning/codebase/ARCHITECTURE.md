# Architecture

## Design Patterns

### 1. Hexagonal Architecture (Ports and Adapters)

The application follows a hexagonal architecture pattern with clear separation of concerns:

- **Core Application Layer** (`src/app/core/application/`): Business logic and domain services
- **Ports** (`src/app/core/application/ports/`): Interfaces defining boundaries between core and infrastructure
- **Infrastructure Layer** (`src/app/core/infrastructure/`): Implementations of ports (Electron adapters, persistence, mock config)

### 2. Clean Architecture Layers

1. **Domain/Models** (`src/app/core/models/`): Plain TypeScript interfaces and types
2. **Application Services** (`src/app/core/services/`): Core business logic and state management
3. **Infrastructure** (`src/app/core/infrastructure/`): External integrations and adapters
4. **Shell/Presentation** (`src/app/shell/`): UI components and Angular templates

## State Management (NgRx)

The application uses NgRx for state management with the following feature slices:

- **session**: Platform and shell readiness state
- **layout**: Sidebar/panel visibility and dimensions
- **uiContext**: Breadcrumbs, status items, available actions
- **preferences**: Versioned workspace preference snapshot
- **workspace**: Tab groups, active tabs, dirty/pinned state
- **shellContent**: Angular component types for dynamic rendering
- **commandTelemetry**: Command execution telemetry
- **statusBar**: Status bar items and states

### State Architecture

- **Reducers**: Feature-specific reducers handling state transitions
- **Effects**: Side effects for async operations (PreferencesEffects, StatusBarEffects, WorkspaceEffects)
- **Selectors**: Feature-specific selectors for state queries
- **Actions**: Feature-specific action definitions

## Data Flow

1. **User Interaction**: UI components in `src/app/shell/components/` trigger actions
2. **State Updates**: NgRx actions dispatched to reducers
3. **Side Effects**: NgRx effects handle async operations (Electron IPC, preferences persistence)
4. **UI Updates**: Selectors subscribe to state changes, components re-render

## Entry Points

- **Angular Bootstrap**: `src/main.ts` - Angular application bootstrap
- **Electron Main**: `src/electron/main.ts` - Electron main process entry point
- **Electron Preload**: `src/electron/preload.ts` - Preload script exposing `IElectronApiPort` to renderer
- **Angular Config**: `src/app/app.config.ts` - Root application configuration with NgRx providers

## Abstractions

### Ports Interface Pattern

Core application layers depend on port interfaces rather than concrete implementations:

- `IElectronApiPort`: Typed shape of Electron preload API
- `IPlatformService`: Platform detection and OS-specific utilities
- `IPreferencesService`: User preference persistence
- `IThemeService`: Theme management
- `IWindowControlsService`: Window-level control operations

### Adapters Pattern

Infrastructure adapters implement port interfaces:

- `PlatformAdapter`: Implements platform detection via Electron IPC
- `PreferencesAdapter`: Implements preference persistence via Electron IPC
- `WindowControlsAdapter`: Implements window control operations via Electron IPC

## Module Organization

- **Core Module**: `src/app/core/` - Domain models, services, state management, infrastructure
- **Shell Module**: `src/app/shell/` - UI components, shell manager, mock UI, contracts
- **Themes Module**: `src/app/themes/` - Theme definitions and styling