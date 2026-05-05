import { Type } from '@angular/core';

export interface PanelTab {
  id: string;
  label: string;
  icon?: string;
  closable: boolean;
  /**
   * Standalone Angular component to render when this panel tab is active.
   * Must be a standalone component (no NgModule required).
   */
  component: Type<unknown>;
}

