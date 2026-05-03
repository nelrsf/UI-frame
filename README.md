# UI Frame

Desktop application built with Angular + Electron (Shell v1).

## Prerequisites

- Node.js 18+
- npm 9+

## Install

```bash
npm install
```

## Scripts pipeline

| Script | Command | Description |
|---|---|---|
| Angular dev server | `npm start` | Serves Angular at `http://localhost:4200` |
| Electron + Angular dev | `npm run electron:dev` | Starts Angular dev server and opens Electron in dev mode |
| Angular production build | `npm run build` | Compiles Angular into `dist/ui-frame/` |
| Compile Electron entrypoints | `npm run build:electron` | Compiles Electron TypeScript into `dist-electron/` |
| Smoke test (local window) | `npm run electron:smoke` | Full build + opens Electron window locally for **interactive** manual verification |
| Package distributable | `npm run electron:dist` | Creates platform packages in `release/` |
| Unit tests | `npm test` | Runs Karma/Jasmine unit tests |
| Shell unit tests | `npm run test:shell` | Runs only shell component unit tests (non-interactive) |
| Automated smoke test | `npm run test:smoke` | Builds and runs headless startup assertions via `scripts/electron-smoke.mjs` |
| Coverage report | `npm run test:coverage` | Runs all unit tests and generates a coverage report in `coverage/` |

## Development

### Angular only (browser)

```bash
npm start
```

Navigate to `http://localhost:4200/`.

### Electron + Angular (dev mode)

```bash
npm run electron:dev
```

This starts the Angular dev server and opens Electron pointing to `http://localhost:4200`.
DevTools open automatically in this mode.

## Build

### Angular production build

```bash
npm run build
```

Build artifacts are stored in `dist/ui-frame/`.

### Compile Electron entrypoints

```bash
npm run build:electron
```

Compiled output goes to `dist-electron/`.

### Package distributable

```bash
npm run electron:dist
```

Creates platform packages in `release/`.

## Smoke test

Run this after significant changes or before releasing to open the Electron window for **interactive manual verification** (the window stays open until you close it):

```bash
npm run electron:smoke
```

For **automated headless assertions** (CI-friendly, exits with a pass/fail code), use `npm run test:smoke` instead — see [Automated validation commands](#automated-validation-commands) below.

## Automated validation commands

### Shell unit tests

Run only the shell component unit tests (non-interactive, single pass):

```bash
npm run test:shell
```

Expected output: Karma reports all shell spec files executed with 0 failures.

### Smoke startup assertions

Build the app and run the headless smoke script that checks the window opens and no blocking errors appear in the startup output:

```bash
npm run test:smoke
```

Expected output:

```
── Shell v1 Smoke Validation ──────────────────────────────

  ✔  Main process did not exit prematurely
  ✔  App window became visible within 15s
  ✔  Shell v1 became visible within 15s
  ✔  No blocking errors in startup output (got: none)
  ✔  BrowserWindow security settings verified (contextIsolation=true, nodeIntegration=false, sandbox=true)

────────────────────────────────────────────────────────────
  Results: 5 passed, 0 failed

  US3 Gate G4: Shell v1 independently functional and secure ✔
```

Exit code `0` means all baseline assertions passed. Exit code `1` means one or more assertions failed; review the output for the failing assertion details.

### Coverage report

Run all unit tests and generate a code-coverage report:

```bash
npm run test:coverage
```

Coverage artifacts are written to `coverage/ui-frame/`. Open `coverage/ui-frame/index.html` in a browser to browse the report.

## Unit tests

```bash
npm test
```

## Project structure

```
src/
  app/          # Angular application
  electron/
    main.ts     # Electron main process
    preload.ts  # Secure contextBridge API
  assets/
  styles.css
angular.json
tsconfig.json
tsconfig.electron.json  # TypeScript config for Electron sources
```

