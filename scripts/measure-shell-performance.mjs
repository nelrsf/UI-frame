/**
 * Shell v1 Performance Measurement
 *
 * Defines the NFR-Perf budget thresholds, documents the PerformanceMeasure
 * entries emitted by the instrumented shell components, and validates the
 * NFR-Perf-04 startup-time budget by launching Electron and timing the
 * shell-visible signal.
 *
 * Interactive budgets (NFR-Perf-01 through NFR-Perf-03) are enforced through
 * performance marks written by the Angular shell components.  They can be
 * inspected in the DevTools Performance panel or evaluated programmatically:
 *
 *   performance.getEntriesByType('measure')
 *     .filter(e => MEASURE_NAMES_SET.has(e.name))
 *     .forEach(e => console.log(e.name, e.duration.toFixed(2) + ' ms'));
 *
 * Usage:
 *   node scripts/measure-shell-performance.mjs
 *
 * Exit codes:
 *   0  All measured assertions passed.
 *   1  One or more assertions failed.
 */

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Performance Budgets ───────────────────────────────────────────────────────

/**
 * NFR-Perf-01: Toggling any supported shell panel must complete in under 100 ms
 * measured at the user-perceived interaction boundary.
 *
 * Relevant PerformanceMeasure names:
 *   'shell.sidebar.toggle'
 *   'shell.bottom-panel.toggle'
 *   'shell.secondary-panel.toggle'
 *   'sidebar.interaction'
 */
export const BUDGET_PANEL_TOGGLE_MS = 100;

/**
 * NFR-Perf-02: Switching the active tab must complete in under 120 ms.
 *
 * Relevant PerformanceMeasure name: 'tabs.switch'
 */
export const BUDGET_TAB_SWITCH_MS = 120;

/**
 * NFR-Perf-03: Continuous resize interactions must sustain > 30 FPS.
 * Expressed as the maximum allowed milliseconds per animation frame.
 *
 * Relevant PerformanceMeasure names:
 *   'shell.bottom-panel.resize'
 *   'shell.secondary-panel.resize'
 */
export const BUDGET_RESIZE_FRAME_MS = 1000 / 30; // ≈ 33.3 ms per frame

/**
 * NFR-Perf-04: The shell frame must become visible within 2 000 ms from
 * app launch in the standard environment.
 */
export const BUDGET_STARTUP_MS = 2_000;

// ── Performance Mark / Measure Names ─────────────────────────────────────────

/**
 * Names of PerformanceMeasure entries emitted by the instrumented Angular
 * shell components for each key interaction path.
 */
export const MEASURE_NAMES = /** @type {const} */ ({
  /** Sidebar collapse / expand — budget: BUDGET_PANEL_TOGGLE_MS */
  sidebarToggle: 'shell.sidebar.toggle',
  /** Sidebar item click (includes collapse / expand) — budget: BUDGET_PANEL_TOGGLE_MS */
  sidebarInteraction: 'sidebar.interaction',
  /** Bottom panel show / hide — budget: BUDGET_PANEL_TOGGLE_MS */
  bottomPanelToggle: 'shell.bottom-panel.toggle',
  /** Bottom panel height resize — budget: BUDGET_RESIZE_FRAME_MS per frame */
  bottomPanelResize: 'shell.bottom-panel.resize',
  /** Secondary panel show / hide — budget: BUDGET_PANEL_TOGGLE_MS */
  secondaryPanelToggle: 'shell.secondary-panel.toggle',
  /** Secondary panel width resize — budget: BUDGET_RESIZE_FRAME_MS per frame */
  secondaryPanelResize: 'shell.secondary-panel.resize',
  /** Tab selection change — budget: BUDGET_TAB_SWITCH_MS */
  tabSwitch: 'tabs.switch',
});

/** Set of all measure names for fast membership checks. */
const MEASURE_NAMES_SET = new Set(Object.values(MEASURE_NAMES));

// ── Budget Table ──────────────────────────────────────────────────────────────

/** Maps each PerformanceMeasure name to its maximum allowed duration (ms). */
export const BUDGETS = /** @type {Record<string, number>} */ ({
  [MEASURE_NAMES.sidebarToggle]:       BUDGET_PANEL_TOGGLE_MS,
  [MEASURE_NAMES.sidebarInteraction]:  BUDGET_PANEL_TOGGLE_MS,
  [MEASURE_NAMES.bottomPanelToggle]:   BUDGET_PANEL_TOGGLE_MS,
  [MEASURE_NAMES.bottomPanelResize]:   BUDGET_RESIZE_FRAME_MS,
  [MEASURE_NAMES.secondaryPanelToggle]: BUDGET_PANEL_TOGGLE_MS,
  [MEASURE_NAMES.secondaryPanelResize]: BUDGET_RESIZE_FRAME_MS,
  [MEASURE_NAMES.tabSwitch]:           BUDGET_TAB_SWITCH_MS,
});

// ── Budget Validator ──────────────────────────────────────────────────────────

/**
 * Validates a single PerformanceEntry against its registered budget.
 *
 * @param {{ name: string; duration: number }} entry - A PerformanceMeasure entry.
 * @returns {{ pass: boolean; budget: number; duration: number }} Result.
 */
export function checkBudget(entry) {
  const budget = BUDGETS[entry.name];
  if (budget === undefined) {
    return { pass: true, budget: Infinity, duration: entry.duration };
  }
  return { pass: entry.duration <= budget, budget, duration: entry.duration };
}

// ── Startup Measurement (NFR-Perf-04) ────────────────────────────────────────

/** Maximum ms to wait for the shell-visible signal. */
const STARTUP_TIMEOUT_MS = Math.min(BUDGET_STARTUP_MS * 3, 15_000);

/** Pattern that indicates the shell became visible (emitted by the main process). */
const SHELL_VISIBLE_RE = /\[smoke\] shell:visible/i;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔  ${message}`);
    passed++;
  } else {
    console.error(`  ✘  ${message}`);
    failed++;
  }
}

async function measureStartup() {
  const binName = process.platform === 'win32' ? 'electron.cmd' : 'electron';
  const expectedBinDir = resolve(ROOT, 'node_modules', '.bin');
  const electronBin = resolve(expectedBinDir, binName);
  const mainEntry = resolve(ROOT, 'dist-electron', 'main.js');

  // Guard: ensure the resolved binary path stays within the expected node_modules
  // directory.  This prevents any accidental path-traversal before the spawn call.
  if (!electronBin.startsWith(expectedBinDir)) {
    console.error(`Security: Electron binary path is outside node_modules: ${electronBin}`);
    process.exit(1);
  }

  if (!existsSync(electronBin)) {
    console.error(`Error: Electron binary not found at ${electronBin}`);
    console.error('Run: npm install');
    process.exit(1);
  }

  if (!existsSync(mainEntry)) {
    console.error(`Error: Main entry not found at ${mainEntry}`);
    console.error('Run: npm run build && npm run build:electron');
    process.exit(1);
  }

  const launchAt = Date.now();
  let shellVisibleAt = null;
  let processExitedEarly = false;

  const args = [mainEntry];
  if (process.env.CI) args.push('--no-sandbox');

  let child;
  if (process.platform === 'win32') {
    child = spawn('cmd.exe', ['/c', electronBin, ...args], {
      cwd: ROOT,
      env: { ...process.env, ELECTRON_ENV: 'smoke', DISPLAY: process.env.DISPLAY ?? ':99' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } else {
    child = spawn(electronBin, args, {
      cwd: ROOT,
      env: { ...process.env, ELECTRON_ENV: 'smoke', DISPLAY: process.env.DISPLAY ?? ':99' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  function onOutput(chunk) {
    if (SHELL_VISIBLE_RE.test(chunk.toString()) && shellVisibleAt === null) {
      shellVisibleAt = Date.now();
    }
  }

  child.stdout.on('data', onOutput);
  child.stderr.on('data', onOutput);

  child.on('exit', (code) => {
    if (code !== null && code !== 0 && shellVisibleAt === null) {
      processExitedEarly = true;
    }
  });

  const deadline = launchAt + STARTUP_TIMEOUT_MS;
  while (shellVisibleAt === null && Date.now() < deadline && !processExitedEarly) {
    await sleep(200);
  }

  if (!child.killed) child.kill('SIGTERM');
  await sleep(200);

  const startupMs = shellVisibleAt !== null ? shellVisibleAt - launchAt : null;

  assert(!processExitedEarly, 'App process did not exit prematurely');

  if (startupMs !== null) {
    assert(
      startupMs <= BUDGET_STARTUP_MS,
      `NFR-Perf-04: Shell visible in ${startupMs} ms (budget: ${BUDGET_STARTUP_MS} ms)`
    );
  } else {
    assert(false, `NFR-Perf-04: Shell visible signal not received within ${STARTUP_TIMEOUT_MS / 1000}s`);
  }
}

async function run() {
  console.log('\n── Shell v1 Performance Measurement ────────────────────────\n');

  console.log('Performance budgets:');
  console.log(`  NFR-Perf-01  Panel toggle     ≤ ${BUDGET_PANEL_TOGGLE_MS} ms`);
  console.log(`  NFR-Perf-02  Tab switch        ≤ ${BUDGET_TAB_SWITCH_MS} ms`);
  console.log(`  NFR-Perf-03  Resize frame      ≤ ${BUDGET_RESIZE_FRAME_MS.toFixed(1)} ms  (> 30 FPS)`);
  console.log(`  NFR-Perf-04  Shell startup     ≤ ${BUDGET_STARTUP_MS} ms`);
  console.log('');
  console.log('Interactive measurement names (inspect in DevTools):');
  for (const [key, name] of Object.entries(MEASURE_NAMES)) {
    const budget = BUDGETS[name];
    console.log(`  ${name.padEnd(36)} budget: ${budget.toFixed(1)} ms  (${key})`);
  }
  console.log('');
  console.log('  Tip: performance.getEntriesByType("measure")');
  console.log('         .filter(e => e.name.startsWith("shell.") || e.name === "tabs.switch" || e.name === "sidebar.interaction")');
  console.log('         .forEach(e => console.log(e.name, e.duration.toFixed(2) + " ms"))');
  console.log('');

  console.log('── NFR-Perf-04: Startup time ────────────────────────────────\n');
  await measureStartup();

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exitCode = 1;
  } else {
    console.log('  Shell v1 startup budget satisfied (NFR-Perf-04) ✔\n');
    console.log('  To validate NFR-Perf-01 through NFR-Perf-03, open DevTools,');
    console.log('  interact with the shell (toggle panels, switch tabs, resize),');
    console.log('  and inspect the PerformanceMeasure entries listed above.\n');
  }
}

run().catch((err) => {
  console.error('measure-shell-performance runner threw an unexpected error:', err);
  process.exitCode = 1;
});
