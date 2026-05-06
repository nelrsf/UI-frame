import { Type } from '@angular/core';

/**
 * Public contract for registering an entry in the shell secondary panel.
 */
export interface ISecondaryPanelEntry {
  /** Stable unique identifier. Duplicate ids are ignored. */
  readonly id: string;
  /** Visible label in the secondary panel tab strip. */
  readonly label: string;
  /** Optional icon displayed next to the label. */
  readonly icon?: string;
  /** Standalone Angular component rendered when this entry is active. */
  readonly component: Type<unknown>;
}
