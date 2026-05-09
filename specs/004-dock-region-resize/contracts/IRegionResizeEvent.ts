export type DockRegionId = 'bottom-panel' | 'secondary-panel' | 'primary-workspace';

/**
 * Typed payload contract for committed dock-region resize events.
 * Event name: shell.region.resized.v1
 */
export interface IRegionResizeEvent {
  /** Region affected by the committed resize interaction. */
  readonly regionId: DockRegionId;
  /** Committed width in integer pixels when width applies to the region. */
  readonly widthPx: number | null;
  /** Committed height in integer pixels when height applies to the region. */
  readonly heightPx: number | null;
  /** Resize origin for this feature scope. */
  readonly source: 'user-drag';
  /** Epoch timestamp (milliseconds) of commit publication. */
  readonly committedAt: number;
}
