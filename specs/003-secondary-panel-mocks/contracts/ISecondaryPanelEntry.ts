import { Type } from '@angular/core';

/**
 * Public contract for registering a selectable content entry in the shell
 * secondary panel region.
 */
export interface ISecondaryPanelEntry {
  /** Stable unique identifier. Duplicate ids are ignored. */
  readonly id: string;
  /** Label shown in the secondary panel tab/entry selector. */
  readonly label: string;
  /** Optional icon shown next to label. */
  readonly icon?: string;
  /**
   * Standalone Angular component rendered when this entry is active.
   */
  readonly component: Type<unknown>;
}
