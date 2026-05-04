import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';
import { CommandRegistration } from '../models/command-registration.model';

/**
 * Normalizes keyboard shortcut strings for display and matching.
 *
 * ### `Mod` token strategy
 * Command definitions use the canonical `Mod` token as the primary modifier.
 * This service resolves `Mod` to the platform-appropriate key:
 * - `Cmd` on macOS
 * - `Ctrl` on Windows and Linux
 *
 * ### macOS overrides
 * A command may supply a `shortcutMac` field to define a macOS-specific
 * binding.  On macOS `getDisplayLabel` uses that value (after normalizing
 * `Mod`) instead of the generic `shortcut`.
 */
@Injectable({ providedIn: 'root' })
export class ShellShortcutsService {
  constructor(private readonly platform: PlatformService) {}

  /**
   * Replaces every occurrence of the `Mod` token in `shortcut` with the
   * platform-appropriate primary modifier key:
   * - `Cmd` on macOS
   * - `Ctrl` on Windows and Linux
   *
   * All other tokens are preserved as-is.
   *
   * @example
   * // macOS
   * normalize('Mod+Shift+P') // → 'Cmd+Shift+P'
   * // Windows / Linux
   * normalize('Mod+Shift+P') // → 'Ctrl+Shift+P'
   */
  normalize(shortcut: string): string {
    const mod = this.platform.isMac ? 'Cmd' : 'Ctrl';
    return shortcut.replace(/\bMod\b/g, mod);
  }

  /**
   * Returns the platform-appropriate shortcut display label for `command`.
   *
   * - On macOS, uses `command.shortcutMac` when provided; otherwise falls
   *   back to `command.shortcut`.
   * - On all other platforms, uses `command.shortcut`.
   * - The resulting string is passed through `normalize()` so `Mod` tokens
   *   are always resolved to the correct modifier before rendering.
   * - Returns `undefined` when neither `shortcut` nor `shortcutMac` is set.
   */
  getDisplayLabel(command: CommandRegistration): string | undefined {
    const raw = this.platform.isMac
      ? (command.shortcutMac ?? command.shortcut)
      : command.shortcut;
    return raw ? this.normalize(raw) : undefined;
  }
}
