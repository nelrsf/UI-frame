import { DockZone } from "../../core/models/dock-zone-assignment.model";

/**
 * Copyright (c) 2024-present NAVER Corp. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 * 
 * Defines the contracts for tabs in the shell. Tabs are the primary content units in the shell's central workspace and are contributed by domain applications via the CentralRegionTab contract. Each tab is associated with a standalone Angular component that is rendered when the tab is active.
 * The WithCloseable and WithDraggable interfaces define optional capabilities that a tab can implement to support close guards and drag-and-drop operations, respectively. The shell's TabBarComponent uses these contracts to determine how to handle user interactions with the tabs without needing to know about the concrete implementations.
 * 
 */


/** Public contract for a tab close guard.  */
export interface TabCloseGuard {
  beforeClose: () => boolean | Promise<boolean>;
}

/** A tab item that can be rendered in the shell's central workspace and optionally supports close guards and drag-and-drop. */
export interface ICloseable {
  dirty: boolean;
  closeGuard?: TabCloseGuard;
}

/** A tab item that can be rendered in the shell's central workspace and optionally supports close guards. */
export interface WithCloseable {
  closeable?: ICloseable;
}

/** A tab item that can be rendered in the shell's central workspace and optionally supports drag-and-drop. */
export interface IDraggable {
  /** The zone the tab is being dragged from. */
  sourceZone: DockZone;
  /** The zone the tab is being dragged to (null if not currently over a valid drop target). */
  targetZone: DockZone;
  /** The zones this tab can be dropped into. Used to validate drop targets during dragging. */
  allowableDropTargets: DockZone[];
}

/** A tab item that can be rendered in the shell's central workspace and optionally supports drag-and-drop. */
export interface WithDraggable {
  draggable?: IDraggable;
}

/** A tab item that can be rendered in the shell's central workspace and optionally supports close guards and drag-and-drop. */
export interface IPinnable {
  pinned: boolean;
}

/** A tab item that can be rendered in the shell's central workspace and optionally supports pinning. */
export interface WithPinnable {
  pinnable?: IPinnable;
}
