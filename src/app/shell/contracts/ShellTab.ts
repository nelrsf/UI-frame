import { Type } from "@angular/core";

/**
 * Copyright (c) 2024-present NAVER Corp. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 * 
 * Defines the contract for a sidebar entry in the Shell. Each entry corresponds to a tab in the sidebar activity bar, and is associated with a standalone Angular component that is rendered when the tab is active.
 * Implementations of this contract are registered with the ShellManager.addSidebarEntry() method, which allows domain applications to contribute their own entries to the shell's sidebar without the shell needing to know about the concrete types.
 * 
 */
export class ShellTab {
  /** Stable unique identifier. Duplicate ids are silently ignored. */
  readonly id!: string;
  /** Accessible label for the sidebar item. */
  readonly label!: string;
  /**
   * Icon identifier (CSS class name or Material ligature).
   * Required because the sidebar activity bar is icon-first.
   */
  readonly icon?: string;
  /**
   * Standalone Angular component rendered when this sidebar entry is active.
   * Must be a standalone component (no NgModule required).
   */
  readonly component!: Type<unknown>;
  /** Optional tooltip shown on hover or keyboard focus. */
  readonly tooltip?: string;
}