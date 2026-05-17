import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DEFAULT_THEME, AppTheme, THEME_PREFERENCE_KEY } from '../../contracts';

interface PreferenceEnvelope {
  schemaVersion: 1;
  data: Record<string, unknown>;
}

export class PreferenceStore {
  private static instance: PreferenceStore | null = null;
  private readonly storePath: string;
  private cachedEnvelope: PreferenceEnvelope | null = null;

  private constructor() {
    this.storePath = path.join(app.getPath('userData'), 'preferences.json');
  }

  static getInstance(): PreferenceStore {
    if (!PreferenceStore.instance) {
      PreferenceStore.instance = new PreferenceStore();
    }
    return PreferenceStore.instance;
  }

  private async loadEnvelope(): Promise<PreferenceEnvelope> {
    if (this.cachedEnvelope) {
      return this.cachedEnvelope;
    }

    try {
      const raw = await fs.readFile(this.storePath, 'utf8');
      const parsed = JSON.parse(raw) as unknown;

      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        (parsed as { schemaVersion?: unknown }).schemaVersion === 1 &&
        typeof (parsed as { data?: unknown }).data === 'object' &&
        (parsed as { data?: unknown }).data !== null
      ) {
        this.cachedEnvelope = parsed as PreferenceEnvelope;
        return this.cachedEnvelope;
      }
    } catch {
      // File not found or invalid JSON — return default envelope
    }

    this.cachedEnvelope = { schemaVersion: 1, data: {} };
    return this.cachedEnvelope;
  }

  private async persistEnvelope(envelope: PreferenceEnvelope): Promise<void> {
    this.cachedEnvelope = envelope;
    await fs.writeFile(this.storePath, JSON.stringify(envelope), 'utf8');
  }

  async read(key: string): Promise<unknown> {
    const envelope = await this.loadEnvelope();
    return envelope.data[key];
  }

  async write(key: string, value: unknown): Promise<void> {
    const envelope = await this.loadEnvelope();
    envelope.data[key] = value;
    await this.persistEnvelope(envelope);
  }

  async readAll(): Promise<Record<string, unknown>> {
    const envelope = await this.loadEnvelope();
    return { ...envelope.data };
  }

  async getTheme(): Promise<AppTheme> {
    const theme = await this.read(THEME_PREFERENCE_KEY);
    if (theme === 'dark' || theme === 'light') {
      return theme;
    }
    return DEFAULT_THEME;
  }

  getStoredThemeSync(): AppTheme {
    try {
      const raw = require('fs').readFileSync(this.storePath, 'utf8');
      const parsed = JSON.parse(raw) as unknown;

      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        (parsed as { schemaVersion?: unknown }).schemaVersion === 1 &&
        typeof (parsed as { data?: unknown }).data === 'object' &&
        (parsed as { data?: unknown }).data !== null
      ) {
        const theme = (parsed as { data: Record<string, unknown> }).data[THEME_PREFERENCE_KEY];
        if (theme === 'dark' || theme === 'light') {
          return theme;
        }
      }
    } catch {
      // File not found or invalid JSON — use default
    }
    return DEFAULT_THEME;
  }
}