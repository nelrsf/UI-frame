import { DockZone } from './dock-zone-assignment.model';

/**
 * Serializable metadata required to identify, order, and reopen a single tab.
 *
 * Only restorable tabs — those whose `viewId` and `resourceKey` are
 * serializable — are included in a persisted session snapshot
 * (spec §Tab Persistence Scope).
 */
export interface TabDescriptor {
  /** Stable identifier for this tab instance. */
  tabId: string;
  /** Identifier of the view type to reopen (maps to a registered view factory). */
  viewId: string;
  /** Optional serializable key that scopes the view to a specific resource. */
  resourceKey?: string;
  /** The dock zone this tab belongs to. */
  zone: DockZone;
  /** Identifier of the tab group this tab belongs to within its zone. */
  groupId: string;
  /** Whether this tab is pinned and protected from accidental close. */
  pinned: boolean;
  /** Whether the user is allowed to close this tab. */
  closable: boolean;
}
