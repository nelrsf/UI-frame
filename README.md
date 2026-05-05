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
| Coverage report | `npm run test:coverage` | Runs all unit tests, generates a coverage report in `coverage/`, and enforces thresholds |
| Coverage report (CI) | `npm run test:coverage:ci` | Same as above, forces `ChromeHeadless` — use in CI pipelines |
| Full validation | `npm run validate` | Runs coverage check (with thresholds) **and** the automated smoke test — the CI gate |
| Performance measurement | `npm run perf:measure` | Times shell startup and prints NFR-Perf budget guidance via `scripts/measure-shell-performance.mjs` (requires pre-built app) |
| Release validation | `npm run validate:release` | Runs `validate` then `perf:measure` — the full release gate covering coverage, startup visibility, and performance budgets |

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
  ✔  Shell DOM contains keyboard-reachable interactive elements

────────────────────────────────────────────────────────────
  Results: 6 passed, 0 failed

  US3 Gate G4: Shell v1 independently functional and secure ✔
```

Exit code `0` means all baseline assertions passed. Exit code `1` means one or more assertions failed; review the output for the failing assertion details.

### Coverage report

Run all unit tests and generate a code-coverage report:

```bash
npm run test:coverage
```

Coverage artifacts are written to `coverage/ui-frame/`. Open `coverage/ui-frame/index.html` in a browser to browse the report. An LCOV trace for CI consumption is written to `coverage/ui-frame/lcov.info`.

### Coverage thresholds

Coverage thresholds are enforced by `karma.conf.js` and apply whenever `--code-coverage` is active (i.e. `test:coverage`, `test:coverage:ci`, and `validate`).

The thresholds are **global** — they are computed across all instrumented source files and must pass as an aggregate:

| Metric | Global threshold |
|---|---|
| Statements | ≥ 80 % |
| Functions | ≥ 80 % |
| Lines | ≥ 80 % |
| Branches | ≥ 70 % |

These gates implement **SC-006** / **NFR-Quality-01**. Core shell services (`src/app/core/services/`) and global shell state (`src/app/core/state/`) are the primary contributors expected to drive these aggregate numbers above the threshold; reaching 80 % coverage in those areas satisfies the requirement across the overall project metric.

If any threshold is not met, Karma exits with a non-zero code and prints a summary such as:

```
ERROR [coverage-summary]: Coverage for statements (72%) does not meet global threshold (80%)
```

Run the following to verify the quality bar locally before pushing:

```bash
npm run test:coverage
```

For CI pipelines (forces `ChromeHeadless`, no interactive watcher):

```bash
npm run test:coverage:ci
```

### Full validation (CI gate)

Run both the coverage threshold check and the automated smoke test in one command:

```bash
npm run validate
```

Exit code `0` means all coverage thresholds passed and all smoke assertions passed. A non-zero exit code means at least one gate failed; review the output for details.

### Performance measurement (NFR-Perf-04 startup budget)

Build the app and run the performance measurement script to validate the NFR-Perf-04 startup time budget and print interactive performance guidance:

```bash
npm run build && npm run build:electron && npm run perf:measure
```

> **Note**: `perf:measure` runs `node scripts/measure-shell-performance.mjs` directly and expects the app to already be built. Running via `validate:release` (see below) handles the build automatically as part of the full sequence.

Expected output:

```
── Shell v1 Performance Measurement ────────────────────────

Performance budgets:
  NFR-Perf-01  Panel toggle     ≤ 100 ms
  NFR-Perf-02  Tab switch        ≤ 120 ms
  NFR-Perf-03  Resize frame      ≤ 33.3 ms  (> 30 FPS)
  NFR-Perf-04  Shell startup     ≤ 2000 ms

Interactive measurement names (inspect in DevTools):
  shell.sidebar.toggle                 budget: 100.0 ms  (sidebarToggle)
  sidebar.interaction                  budget: 100.0 ms  (sidebarInteraction)
  shell.bottom-panel.toggle            budget: 100.0 ms  (bottomPanelToggle)
  shell.bottom-panel.resize            budget: 33.3 ms  (bottomPanelResize)
  shell.secondary-panel.toggle         budget: 100.0 ms  (secondaryPanelToggle)
  shell.secondary-panel.resize         budget: 33.3 ms  (secondaryPanelResize)
  tabs.switch                          budget: 120.0 ms  (tabSwitch)

── NFR-Perf-04: Startup time ────────────────────────────────

  ✔  App process did not exit prematurely
  ✔  NFR-Perf-04: Shell visible in 843 ms (budget: 2000 ms)

────────────────────────────────────────────────────────────
  Results: 2 passed, 0 failed

  Shell v1 startup budget satisfied (NFR-Perf-04) ✔

  To validate NFR-Perf-01 through NFR-Perf-03, open DevTools,
  interact with the shell (toggle panels, switch tabs, resize),
  and inspect the PerformanceMeasure entries listed above.
```

To validate NFR-Perf-01 through NFR-Perf-03 interactively, open DevTools in the running app and run:

```js
performance.getEntriesByType('measure')
  .filter(e => e.name.startsWith('shell.') || e.name === 'tabs.switch' || e.name === 'sidebar.interaction')
  .forEach(e => console.log(e.name, e.duration.toFixed(2) + ' ms'));
```

### Release validation (full release gate)

Run coverage, startup smoke, and performance budget checks in one command:

```bash
npm run validate:release
```

This is the complete release gate for Shell v1. It runs `validate` (coverage thresholds + startup smoke assertions) followed by `perf:measure` (NFR-Perf-04 startup time budget). Exit code `0` means all checks passed.

## Unit tests

```bash
npm test
```

## Mock UI Validation

The repository ships a dedicated **Mock UI screen** to validate the UI Frame's visual layout (sidebar, toolbar alerts, bottom panel, and two tabs) without any production logic or external dependencies.

For a complete guide on how to activate the mock screen, extend it with new fixtures, and safely remove it when no longer needed, see [specs/002-validate-ui-frame/quickstart.md](specs/002-validate-ui-frame/quickstart.md).

---

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

## Accessibility

Shell v1 maintains a baseline of structural accessibility across all shell regions. Contributors
must preserve the following expectations; they are validated by targeted unit tests in
`src/app/shell/**/*.spec.ts` and by the keyboard reachability assertion in the automated smoke test.

### ARIA landmarks

| Shell region | Element selector | Role |
|---|---|---|
| Application root | `.shell-root` | `application` |
| Workspace area | `.shell-workspace` | `region` |
| Sidebar | `[data-testid="sidebar"]` | `complementary` |
| Activity bar | `[data-testid="activity-bar"]` | `navigation` |
| Sidebar panel | `[data-testid="sidebar-panel"]` | `region` |
| Toolbar | `[data-testid="toolbar"]` | `toolbar` |
| Tab bar | `[data-testid="tab-bar"]` | `tablist` |
| Content area | `[data-testid="content-area"]` | `main` |
| Bottom panel | `[data-testid="bottom-panel"]` | `complementary` |
| Secondary panel | `[data-testid="secondary-panel"]` | `complementary` |
| Status bar | `.shell-statusbar` | `contentinfo` |

### Key ARIA attributes

- All interactive buttons carry a descriptive `aria-label`.
- Tabs use `aria-selected` to reflect active state and `tabindex="0"` / `tabindex="-1"` for roving focus.
- The sidebar carries `aria-expanded` to reflect its collapsed/expanded state.
- The status bar carries `aria-live="polite"` so screen readers announce status changes.
- The content area empty state carries `aria-live="polite"` for assistive technology announcements.

### Keyboard navigation

- All interactive shell regions are reachable via the `Tab` key. Buttons are native `<button>` elements and are naturally keyboard focusable.
- Within a tab bar, the active tab has `tabindex="0"` and inactive tabs have `tabindex="-1"` (roving tabindex pattern). This is validated by the unit tests and by the `[smoke] keyboard:reachable` assertion in the automated smoke test.
- The smoke test verifies that at least one non-disabled interactive element is reachable by keyboard on a fresh shell launch.

