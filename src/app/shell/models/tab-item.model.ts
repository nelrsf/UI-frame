export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  dirty: boolean;
  closable: boolean;
  pinned: boolean;
  groupId: string;
}

export interface TabCloseGuard {
  beforeClose: () => boolean | Promise<boolean>;
}
