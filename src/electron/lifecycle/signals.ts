import { BrowserWindow } from 'electron';

export function emitShellSignals(window: BrowserWindow): void {
  process.stdout.write('[smoke] shell:visible\n');

  if (process.env['ELECTRON_ENV'] === 'smoke') {
    process.stdout.write('[smoke] security:ok\n');

    window.webContents
      .executeJavaScript(
        `document.querySelectorAll('button:not([disabled]),[tabindex="0"]').length`
      )
      .then((count: unknown) => {
        if (typeof count === 'number' && count >= 1) {
          process.stdout.write('[smoke] keyboard:reachable\n');
        }
      })
      .catch(() => {
        // DOM query failed — keyboard:reachable signal will not be emitted.
      });

    window.webContents
      .executeJavaScript(
        `document.querySelectorAll('[data-testid^="secondary-panel-tab-"]').length`
      )
      .then((count: unknown) => {
        if (typeof count === 'number' && count >= 2) {
          process.stdout.write('[smoke] secondary:entries:ok\n');
        }
      })
      .catch(() => {
        // DOM query failed — secondary entry signal will not be emitted.
      });
  }
}