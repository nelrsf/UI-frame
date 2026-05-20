import { Type } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  dirty: boolean;
  closable: boolean;
  pinned: boolean;
  groupId: string;
  /** Angular component type for dynamic rendering via NgComponentOutlet. */
  componentType?: Type<unknown>;
  /** Close guard for dirty-tab protection. Consulted before closing a dirty tab. */
  closeGuard?: TabCloseGuard;
}

export interface TabCloseGuard {
  beforeClose: () => boolean | Promise<boolean>;
}
