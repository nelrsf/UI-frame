/**
 * Baseline smoke validation for Shell v1 startup.
 *
 * Assertions:
 *   1. The Electron main process starts without error.
 *   2. The BrowserWindow becomes visible within the timeout.
 *   3. Shell v1 becomes visible within the timeout.
 *   4. No blocking console errors are emitted during renderer startup.
 *   5. BrowserWindow security settings are verified (contextIsolation, no
 *      nodeIntegration, sandbox) — NFR-Security-01.
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
import { existsSync } from 'node:fs';

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

/**
 * Patterns that confirm BrowserWindow security settings are active.
 * The main process emits `[smoke] security:ok` when it detects that
 * contextIsolation=true, nodeIntegration=false, and sandbox=true are all
 * set on the live webContents — satisfying NFR-Security-01.
 *
 * Structured as an array (consistent with WINDOW_READY_PATTERNS and
 * SHELL_VISIBLE_PATTERNS) so that additional security signals can be added
 * without changing the processOutput logic.
 */
const SECURITY_OK_PATTERNS = [
  /\[smoke\] security:ok/i,
];

/**
 * Patterns that confirm at least one keyboard-reachable interactive element
 * is present in the rendered shell DOM — satisfying the keyboard reachability
 * requirement from US1 Acceptance Scenario 3 (FR-Accessibility).
 *
 * The main process emits `[smoke] keyboard:reachable` in smoke mode after
 * querying the renderer for focusable interactive elements via
 * webContents.executeJavaScript().
 */
const KEYBOARD_REACHABLE_PATTERNS = [
  /\[smoke\] keyboard:reachable/i,
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

  const binName = process.platform === 'win32' ? 'electron.cmd' : 'electron';
  const electronBin = resolve(ROOT, 'node_modules', '.bin', binName);
  const mainEntry = resolve(ROOT, 'dist-electron', 'main.js');

  // Validate Electron binary exists
  if (!existsSync(electronBin)) {
    console.error(`Error: Electron binary not found at ${electronBin}`);
    console.error('Try deleting node_modules and running npm install again.');
    process.exit(1);
  }

  // Validate main entry point exists
  if (!existsSync(mainEntry)) {
    console.error(`Error: Main entry not found at ${mainEntry}`);
    console.error('Ensure you have run npm run build && npm run build:electron successfully.');
    process.exit(1);
  }

  let windowVisible = false;
  let shellVisible = false;
  let blockingError = null;
  let processExitedEarly = false;
  let securityOk = false;
  let keyboardReachable = false;

  // --no-sandbox is required in headless CI environments (e.g. Linux without SUID sandbox).
  // It is enabled only when the CI environment variable is set so that local runs keep
  // the full sandbox active.
  const args = [mainEntry];
  if (process.env.CI) {
    args.push('--no-sandbox');
  }

  let child;
  if (process.platform === 'win32') {
    // Windows requires cmd /c to execute .cmd batch files
    child = spawn('cmd.exe', ['/c', electronBin, ...args], {
      cwd: ROOT,
      env: {
        ...process.env,
        ELECTRON_ENV: 'smoke',
        DISPLAY: process.env.DISPLAY ?? ':99',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } else {
    child = spawn(electronBin, args, {
      cwd: ROOT,
      env: {
        ...process.env,
        ELECTRON_ENV: 'smoke',
        DISPLAY: process.env.DISPLAY ?? ':99',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

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
    if (SECURITY_OK_PATTERNS.some((re) => re.test(text))) {
      securityOk = true;
    }
    if (KEYBOARD_REACHABLE_PATTERNS.some((re) => re.test(text))) {
      keyboardReachable = true;
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
  assert(securityOk, 'BrowserWindow security settings verified (contextIsolation=true, nodeIntegration=false, sandbox=true)');
  assert(keyboardReachable, 'Shell DOM contains keyboard-reachable interactive elements');

  // ── Summary ─────────────────────────────────────────────────

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(`  Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exitCode = 1;
  }

  // ── US3 Gate G4 ─────────────────────────────────────────────
  // Six passing assertions confirm the Shell v1 startup path is
  // independently functional, secure, and keyboard-accessible,
  // satisfying the Phase 4 exit gate (G4):
  //   FR-AppShell, FR-ShellComponents, FR-Layout, FR-Accessibility
  //   (structural + keyboard reachability), FR-Security (NFR-Security-01).
  if (failed === 0) {
    console.log('  US3 Gate G4: Shell v1 independently functional and secure ✔\n');
  }
}

runSmoke().catch((err) => {
  console.error('Smoke runner threw an unexpected error:', err);
  process.exitCode = 1;
});
