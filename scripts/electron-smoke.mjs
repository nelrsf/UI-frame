/**
 * Baseline smoke validation for Shell v1 startup.
 *
 * Assertions:
 *   1. The Electron main process starts without error.
 *   2. The BrowserWindow becomes visible within the timeout.
 *   3. No blocking console errors are emitted during renderer startup.
 *
 * Usage:
 *   npm run test:smoke
 *
 * Exit codes:
 *   0  All assertions passed.
 *   1  One or more assertions failed.
 */

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/** Maximum milliseconds to wait for the window to become visible. */
const WINDOW_VISIBLE_TIMEOUT_MS = 15_000;

/** Patterns in stderr/stdout that indicate a blocking startup error. */
const BLOCKING_ERROR_PATTERNS = [
  /Error:/i,
  /Exception:/i,
  /Cannot find module/i,
  /Unhandled promise rejection/i,
  /ReferenceError:/i,
  /TypeError:/i,
  /SyntaxError:/i,
];

/** Patterns that indicate the window became visible. */
const WINDOW_READY_PATTERNS = [
  /window.*ready/i,
  /did-finish-load/i,
  /shell.*visible/i,
  /app.*ready/i,
];

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

async function runSmoke() {
  console.log('\n── Shell v1 Smoke Validation ──────────────────────────────\n');

  const electronBin = resolve(ROOT, 'node_modules', '.bin', 'electron');
  const mainEntry = resolve(ROOT, 'dist-electron', 'main.js');

  let windowVisible = false;
  let blockingError = null;
  let processExitedEarly = false;

  // --no-sandbox is required in headless CI environments (e.g. Linux without SUID sandbox).
  // It is enabled only when the CI environment variable is set so that local runs keep
  // the full sandbox active.
  const args = [mainEntry];
  if (process.env.CI) {
    args.push('--no-sandbox');
  }

  const child = spawn(electronBin, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      ELECTRON_ENV: 'smoke',
      DISPLAY: process.env.DISPLAY ?? ':99',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    if (WINDOW_READY_PATTERNS.some((re) => re.test(text))) {
      windowVisible = true;
    }
  });

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    // Electron prints many informational lines to stderr — only flag real errors.
    for (const pattern of BLOCKING_ERROR_PATTERNS) {
      if (pattern.test(text) && blockingError === null) {
        blockingError = text.trim();
        break;
      }
    }
    if (WINDOW_READY_PATTERNS.some((re) => re.test(text))) {
      windowVisible = true;
    }
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0 && !windowVisible) {
      processExitedEarly = true;
    }
  });

  // Poll until window is visible or timeout elapses.
  const deadline = Date.now() + WINDOW_VISIBLE_TIMEOUT_MS;
  while (!windowVisible && Date.now() < deadline && !processExitedEarly) {
    await sleep(500);
  }

  // Tear down the process.
  if (!child.killed) {
    child.kill('SIGTERM');
  }

  // Allow one tick for exit handler to fire.
  await sleep(200);

  // ── Assertions ──────────────────────────────────────────────

  assert(!processExitedEarly, 'Main process did not exit prematurely');
  assert(windowVisible, `App window became visible within ${WINDOW_VISIBLE_TIMEOUT_MS / 1000}s`);
  assert(blockingError === null, `No blocking errors in startup output (got: ${blockingError ?? 'none'})`);

  // ── Summary ─────────────────────────────────────────────────

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runSmoke().catch((err) => {
  console.error('Smoke runner threw an unexpected error:', err);
  process.exitCode = 1;
});
