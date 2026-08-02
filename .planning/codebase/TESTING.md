# Testing Practices

## Testing Framework

- **Test Runner**: Jasmine ~5.1.0
- **Test Browser Launcher**: karma-chrome-launcher ~3.2.0
- **Test Reporter**: karma-jasmine-html-reporter ~2.1.0
- **Coverage Tool**: karma-coverage ~2.2.0
- **Angular Testing**: @angular-devkit/build-angular:karma builder

## Test Structure

### File Naming Convention

- Test files are named `*.spec.ts` (e.g., `shell.component.spec.ts`, `preferences.adapter.spec.ts`)
- Test files are co-located with the source files they test

### Test Organization

- **describe blocks**: Group related tests by feature or component
- **it blocks**: Individual test cases with descriptive names
- **beforeEach/afterEach**: Setup and teardown for tests requiring state

## Coverage Requirements

From `karma.conf.js`:

```javascript
check: {
  global: {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80
  }
}
```

**Target Coverage Metrics:**
- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

**Primary contributors to coverage:**
- Core services (`src/app/core/services/`)
- Core state (`src/app/core/state/`)

## Test Scripts

From `package.json`:

- `npm run test`: Run all tests
- `npm run test:shell`: Run shell component tests only (`src/app/shell/**/*.spec.ts`)
- `npm run test:coverage`: Run tests with coverage report
- `npm run test:coverage:ci`: Run tests with coverage in CI mode (ChromeHeadless)
- `npm run test:smoke`: Build and run Electron smoke tests
- `npm run validate`: Run coverage CI tests + smoke tests
- `npm run validate:release`: Run validate + performance measure

## Mocking Patterns

### NgRx Store Mocking

- Use `Store` from `@ngrx/store` in test providers
- Mock actions and selectors for state testing
- Use `provideStore({}, { runtimeChecks: { ... } })` for testing without strict immutability checks

### Electron API Mocking

- `IElectronApiPort` interface used for typed Electron API access
- Mock implementations provided via `MockConfigLoader` for testing without Electron runtime
- Adapters (`PlatformAdapter`, `PreferencesAdapter`, `WindowControlsAdapter`) tested with mock port implementations

### Mock UI Components

- `src/app/shell/mock-ui/`: Mock UI implementations for testing shell components
- Mock components include: `mock-bottom-panel`, `mock-dashboard`, `mock-reports`, `mock-secondary-panel`, `mock-sidebar`

## Test Categories

1. **Unit Tests**: Component, service, and reducer tests
2. **Integration Tests**: Docking integration tests (`docking.integration.spec.ts`)
3. **Smoke Tests**: End-to-end Electron application tests (`scripts/electron-smoke.mjs`)

## Test Configuration

- `karma.conf.js`: Karma configuration with ChromeHeadless browser
- `tsconfig.spec.json`: TypeScript configuration for test files
- `src/app/core/infrastructure/mock-config/mock-config.loader.ts`: Mock configuration loader for testing