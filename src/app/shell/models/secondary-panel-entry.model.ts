import { Type } from '@angular/core';

export interface SecondaryPanelEntry {
  id: string;
  label: string;
  icon?: string;
  component: Type<unknown>;
}
