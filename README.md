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
| Smoke test (local window) | `npm run electron:smoke` | Full build + opens Electron window locally for verification |
| Package distributable | `npm run electron:dist` | Creates platform packages in `release/` |
| Unit tests | `npm test` | Runs Karma/Jasmine unit tests |

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

Run this after significant changes or before releasing to verify the shell window opens without errors:

```bash
npm run electron:smoke
```

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

