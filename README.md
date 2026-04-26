# UI Frame

Desktop application built with Angular + Electron (Shell v1).

## Prerequisites

- Node.js 18+
- npm 9+

## Install

```bash
npm install
```

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

### Run production build in Electron (smoke test)

```bash
npm run electron:build
```

Builds Angular + compiles Electron and opens the app loading the local build.

### Package distributable

```bash
npm run electron:dist
```

Creates platform packages in `release/`.

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

