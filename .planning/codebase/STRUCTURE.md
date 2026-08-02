# Directory Structure

## Root Directory Layout

```
ui-frame/
├── .agents/                 # Agent skills and configurations
├── .angular/                # Angular CLI cache
├── .engram/                 # Engram persistent memory
├── .git/                    # Git repository
├── .github/                 # GitHub configurations
├── .pi/                     # GSD workflow configurations
├── .specify/                # Specification templates and workflows
├── .vscode/                 # VS Code settings
├── dist/                    # Build output (Angular)
├── dist-electron/           # Build output (Electron)
├── coverage/                # Code coverage reports
├── graphify-out/            # Graphify knowledge graph output
├── node_modules/            # Node.js dependencies
├── scripts/                 # Build and test scripts
├── specs/                   # Feature specifications
├── src/                     # Source code
│   ├── app/                 # Angular application
│   ├── assets/              # Static assets
│   ├── contracts/           # Contract definitions
│   ├── electron/            # Electron main/preload code
│   ├── favicon.ico          # Application favicon
│   ├── index.html           # Angular entry HTML
│   ├── main.ts              # Angular bootstrap entry
│   └── styles.css           # Global styles
├── .editorconfig            # Editor configuration
├── angular.json             # Angular CLI configuration
├── karma.conf.js            # Karma test configuration
├── package.json             # Node.js dependencies and scripts
├── tsconfig.app.json        # TypeScript app configuration
├── tsconfig.electron.json   # TypeScript Electron configuration
├── tsconfig.json            # Base TypeScript configuration
└── tsconfig.spec.json       # TypeScript test configuration
```

## Application Source Structure (`src/app/`)

```
src/app/
├── app.component.css        # Root component styles
├── app.component.html       # Root component template
├── app.component.spec.ts    # Root component tests
├── app.component.ts         # Root component
├── app.config.ts            # Root application configuration
├── core/                    # Core domain and infrastructure
│   ├── application/         # Application layer (business logic)
│   │   ├── ports/           # Port interfaces (IElectronApiPort, etc.)
│   │   └── theme.service.ts # Theme service implementation
│   ├── infrastructure/      # Infrastructure implementations
│   │   ├── electron/        # Electron adapters
│   │   │   └── adapters/    # Platform, preferences, window controls adapters
│   │   ├── mock-config/     # Mock configuration loader
│   │   └── persistence/     # Persistence implementations
│   │       └── local-storage/ # Local storage preferences repository
│   ├── models/              # Domain models and interfaces
│   ├── services/            # Core services (command registry, platform, shortcuts, preferences, workspace session)
│   ├── state/               # NgRx state management
│   │   ├── command-telemetry/ # Command telemetry state
│   │   ├── common/          # Common state utilities
│   │   ├── layout/          # Layout state (sidebar/panel visibility)
│   │   ├── preferences/     # Preferences state
│   │   ├── session/         # Session state
│   │   ├── shell-content/   # Shell content state
│   │   ├── status-bar/      # Status bar state
│   │   ├── ui-context/      # UI context state
│   │   ├── workspace/       # Workspace state (tabs, groups)
│   │   └── zone-dimensions/ # Zone dimensions state
│   └── utils/               # Core utilities
├── shell/                   # Shell/UI layer
│   ├── common/              # Shell common utilities
│   ├── components/          # UI components
│   │   ├── dock-zone-panel/ # Dock zone panel components
│   │   ├── drag-ghost/      # Drag ghost components
│   │   ├── layout-splittable-panel/ # Layout splittable panel
│   │   ├── shell-splitter-handle/ # Shell splitter handle
│   │   ├── sidebar/         # Sidebar components
│   │   │   └── activity-bar/ # Activity bar components
│   │   ├── status-bar/      # Status bar components
│   │   ├── tab-add-modal/   # Tab add modal
│   │   └── toolbar/         # Toolbar components
│   ├── contracts/           # Shell contracts
│   ├── mock-ui/             # Mock UI implementations
│   │   ├── components/      # Mock UI components
│   │   ├── fixtures/        # Mock fixtures
│   │   └── models/          # Mock UI models
│   ├── models/              # Shell models
│   ├── services/            # Shell services (shell manager, etc.)
│   ├── docking.integration.spec.ts # Docking integration tests
│   ├── shell-manager.service.ts # Shell manager service
│   ├── shell.component.*    # Shell component files
│   └── shell.persistence.spec.ts # Shell persistence tests
└── themes/                  # Theme definitions and styling
```

## Key Locations

- **Entry Points**:
  - `src/main.ts`: Angular bootstrap
  - `src/electron/main.ts`: Electron main process
  - `src/electron/preload.ts`: Electron preload script
  - `src/app/app.config.ts`: Angular app configuration

- **State Management**:
  - `src/app/core/state/`: NgRx state slices

- **Services**:
  - `src/app/core/services/`: Core services
  - `src/app/shell/services/`: Shell services

- **Components**:
  - `src/app/shell/components/`: UI components

- **Infrastructure**:
  - `src/app/core/infrastructure/`: Adapters and implementations

## Naming Conventions

- **Components**: `component-name.component.ts`, `component-name.component.html`, `component-name.component.css`
- **Services**: `service-name.service.ts`
- **State**: `feature-name.actions.ts`, `feature-name.reducer.ts`, `feature-name.selectors.ts`, `feature-name.effects.ts`
- **Ports**: `I{Name}Service` or `I{Name}Port` (e.g., `IElectronApiPort`, `IPlatformService`)
- **Adapters**: `*-adapter.ts` (e.g., `platform.adapter.ts`, `preferences.adapter.ts`)
- **Models**: `*-model.ts` or `*.model.ts` (e.g., `tab-descriptor.model.ts`, `preferences.model.ts`)
- **Contracts**: `*-contract.ts` or `*.contract.ts`
- **Tests**: `*.spec.ts` (e.g., `shell.component.spec.ts`, `preferences.adapter.spec.ts`)