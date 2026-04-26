/** Current schema version. Bump when persisted shape changes incompatibly. */
export const PREFERENCES_SCHEMA_VERSION = 1;

/** Shape of a versioned preferences envelope stored in local storage. */
export interface PreferencesEnvelope {
  schemaVersion: number;
  workspaceId: string;
  /** ISO 8601 timestamp recording when this envelope was last saved. */
  savedAt: string;
  data: Record<string, unknown>;
}

/** Marker interface for the raw map of user preference key–value pairs. */
export type PreferencesData = Record<string, unknown>;
