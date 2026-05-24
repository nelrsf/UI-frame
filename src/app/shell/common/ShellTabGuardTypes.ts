import { ShellTab } from "../contracts/ShellTab";
import { WithCloseable, WithPinnable, WithDraggable } from "../models/tab-item.model";

export function isTabDraggable<T extends ShellTab>(tab: T): tab is T & WithDraggable {
  return 'draggable' in tab && typeof tab.draggable !== undefined;
}

export function isTabCloseable<T extends ShellTab>(tab: T): tab is T & WithCloseable {
  return 'closeable' in tab && typeof tab.closeable !== undefined;
}

export function isTabPinnable<T extends ShellTab>(tab: T): tab is T & WithPinnable {
  return 'pinnable' in tab && typeof tab.pinnable !== undefined;
}