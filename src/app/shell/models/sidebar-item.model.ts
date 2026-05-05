import { Type } from '@angular/core';

export interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  tooltip: string;
  badge?: number;
  position: 'top' | 'bottom';
  /**
   * Standalone Angular component to render when this sidebar item is active.
   * Must be a standalone component (no NgModule required).
   */
  component: Type<unknown>;
}

