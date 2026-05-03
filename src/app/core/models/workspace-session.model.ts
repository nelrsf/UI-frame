import { DockZone, DockZoneAssignment } from './dock-zone-assignment.model';
import { TabDescriptor } from './tab-descriptor.model';

export { TabDescriptor };

/** Current schema version for workspace session envelopes. */
export const WORKSPACE_SESSION_SCHEMA_VERSION = 1;

/**
 * Persisted layout dimension snapshot for a workspace session.
 * Values are clamped to zone `minSize`/`maxSize` during restoration.
 */
export interface WorkspaceSessionDimensions {
  /** Pixel width of the sidebar. */
  sidebarWidth: number;
  /** Pixel height of the bottom panel. */
  bottomPanelHeight: number;
  /** Pixel width of the secondary right-side panel. */
  secondaryPanelWidth: number;
}

/**
 * Restorable shell snapshot for one workspace.
 *
 * Captures the full set of state required to reconstruct the last valid
 * shell layout for a workspace, including open tabs, active tab per zone,
 * dock zone assignments, and persisted layout dimensions.
 */
export interface WorkspaceSession {
  /** Canonical workspace identifier (e.g. `ws-<16 hex chars>` or `ws-default`). */
  workspaceId: string;
  /** Schema version — used to reject incompatible snapshots on restore. */
  schemaVersion: number;
  /** ISO 8601 timestamp recording when this snapshot was last saved. */
  savedAt: string;
  /**
   * Dock zone assignments for all tab groups present in this session.
   * One entry per tab group; zones without a group are considered empty.
   */
  zoneAssignments: DockZoneAssignment[];
  /**
   * The active tab identifier per dock zone at the time the snapshot was taken.
   * Absent for zones that had no active tab.
   */
  activeTabPerZone: Partial<Record<DockZone, string>>;
  /**
   * Ordered list of restorable tab descriptors.
   * Tabs are listed in their group display order; non-restorable tabs are excluded.
   */
  tabs: TabDescriptor[];
  /** Persisted pixel dimensions for resizable shell zones. */
  dimensions: WorkspaceSessionDimensions;
}
