/**
 * Enumeration of the three fixed dock zones supported by Shell v1 MVP.
 *
 * Docking v1 explicitly excludes floating panels, arbitrary split trees,
 * detached windows, and nested dock hierarchies (spec §Docking Scope for MVP).
 */
export enum DockZone {
  /** The primary editor or content area occupying the central workspace. */
  PrimaryWorkspace = 'primary-workspace',
  /** The collapsible panel anchored to the bottom of the shell. */
  BottomPanel = 'bottom-panel',
  /** The collapsible panel anchored to the right side of the shell. */
  SecondaryPanel = 'secondary-panel',
}

/**
 * Associates a tab group with one of the supported dock zones and carries the
 * visibility state and size constraints for that zone.
 *
 * Size semantics by zone:
 * - `PrimaryWorkspace`: no explicit size (fills remaining space).
 * - `BottomPanel`: `size` represents height in pixels.
 * - `SecondaryPanel`: `size` represents width in pixels.
 */
export interface DockZoneAssignment {
  /** Identifier of the tab group assigned to this zone. */
  tabGroupId: string;
  /** The dock zone to which the tab group is assigned. */
  zone: DockZone;
  /** Whether this zone is currently visible in the shell layout. */
  visible: boolean;
  /**
   * Current pixel dimension of the zone (height for bottom panel,
   * width for secondary panel). Absent for the primary workspace zone.
   */
  size?: number;
  /** Minimum allowed pixel dimension. Clamped during layout restore. */
  minSize?: number;
  /** Maximum allowed pixel dimension. Clamped during layout restore. */
  maxSize?: number;
}
