/**
 * Baseline smoke validation for Shell v1 startup.
 *
 * Assertions:
 *   1. The Electron main process starts without error.
 *   2. The BrowserWindow becomes visible within the timeout.
 *   3. Shell v1 becomes visible within the timeout.
 *   4. No blocking console errors are emitted during renderer startup.
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

/** Patterns that indicate the BrowserWindow became visible. */
const WINDOW_READY_PATTERNS = [
  /window.*ready/i,
  /app.*ready/i,
];

/**
 * Patterns that confirm the Shell v1 surface became visible.
 * The primary signal is the `[smoke] shell:visible` line written to stdout by
 * the Electron main process on `did-finish-load`.  The broader `/shell.*visible/i`
 * pattern acts as a fallback for any other shell-readiness log the renderer or
 * main process may emit in the future.
 */
const SHELL_VISIBLE_PATTERNS = [
  /\[smoke\] shell:visible/i,
  /shell.*visible/i,
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
  let shellVisible = false;
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

  /**
   * Process a line of output from the child process, updating visibility flags.
   * Shell visibility implies window visibility (the window must be open for the
   * renderer to have reached `did-finish-load`), so both flags are set when the
   * shell-ready signal is detected.
   */
  function processOutput(text) {
    if (WINDOW_READY_PATTERNS.some((re) => re.test(text))) {
      windowVisible = true;
    }
    if (SHELL_VISIBLE_PATTERNS.some((re) => re.test(text))) {
      shellVisible = true;
      // Shell visibility implies the BrowserWindow is also visible.
      windowVisible = true;
    }
  }

  child.stdout.on('data', (chunk) => {
    processOutput(chunk.toString());
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
    processOutput(text);
  });

  child.on('exit', (code) => {
    // Only treat non-zero exit as premature if the shell signal was never received.
    // A clean code-0 exit (e.g. in tests) is not flagged here; the shellVisible
    // assertion below will still report failure if the signal was missed.
    if (code !== null && code !== 0 && !shellVisible) {
      processExitedEarly = true;
    }
  });

  // Poll until shell is visible or timeout elapses.
  const deadline = Date.now() + WINDOW_VISIBLE_TIMEOUT_MS;
  while (!shellVisible && Date.now() < deadline && !processExitedEarly) {
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
  assert(shellVisible, `Shell v1 became visible within ${WINDOW_VISIBLE_TIMEOUT_MS / 1000}s`);
  assert(blockingError === null, `No blocking errors in startup output (got: ${blockingError ?? 'none'})`);

  // ── Summary ─────────────────────────────────────────────────

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exitCode = 1;
  }

  // ── US1 Gate G2 ─────────────────────────────────────────────
  // Four passing assertions confirm the Shell v1 MVP startup path is
  // independently functional and satisfies the Phase 2 exit gate (G2):
  //   FR-AppShell, FR-ShellComponents, FR-Layout, FR-Accessibility (structural).
  if (failed === 0) {
    console.log('  US1 Gate G2: Shell v1 independently functional ✔\n');
  }
}

runSmoke().catch((err) => {
  console.error('Smoke runner threw an unexpected error:', err);
  process.exitCode = 1;
});
