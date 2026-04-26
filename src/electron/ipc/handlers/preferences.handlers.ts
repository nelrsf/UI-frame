import { app, ipcMain, IpcMainInvokeEvent } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IPC_CHANNELS } from '../channels';

/** Versioned envelope written to disk. */
interface PreferencesEnvelope {
  schemaVersion: 1;
  data: Record<string, unknown>;
}

const SCHEMA_VERSION = 1 as const;

function resolveStorePath(): string {
  return path.join(app.getPath('userData'), 'preferences.json');
}

async function readEnvelope(): Promise<PreferencesEnvelope> {
  try {
    const raw = await fs.readFile(resolveStorePath(), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      (parsed as PreferencesEnvelope).schemaVersion === SCHEMA_VERSION &&
      typeof (parsed as PreferencesEnvelope).data === 'object' &&
      (parsed as PreferencesEnvelope).data !== null
    ) {
      return parsed as PreferencesEnvelope;
    }
  } catch {
    // File missing or parse error — fall through to fresh envelope.
  }
  return { schemaVersion: SCHEMA_VERSION, data: {} };
}

async function writeEnvelope(envelope: PreferencesEnvelope): Promise<void> {
  await fs.writeFile(resolveStorePath(), JSON.stringify(envelope), 'utf8');
}

/**
 * Register all preferences IPC handlers.
 *
 * Handlers validate that the `key` argument is a non-empty string before
 * reading or writing, returning the `defaultValue` on any validation or I/O
 * failure so the renderer always receives a deterministic result.
 */
export function registerPreferencesHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.PREFERENCES.GET,
    async (_event: IpcMainInvokeEvent, key: unknown, defaultValue: unknown): Promise<unknown> => {
      if (typeof key !== 'string' || key.trim() === '') {
        return defaultValue;
      }
      try {
        const envelope = await readEnvelope();
        return Object.prototype.hasOwnProperty.call(envelope.data, key)
          ? envelope.data[key]
          : defaultValue;
      } catch {
        return defaultValue;
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.PREFERENCES.SET,
    async (_event: IpcMainInvokeEvent, key: unknown, value: unknown): Promise<void> => {
      if (typeof key !== 'string' || key.trim() === '') {
        return;
      }
      try {
        const envelope = await readEnvelope();
        envelope.data[key] = value;
        await writeEnvelope(envelope);
      } catch {
        // Swallow write errors — renderer must not crash on persistence failure.
      }
    },
  );
}
