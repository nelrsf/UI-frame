import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { StatusBarItem } from '../../../shell/models/status-bar-item.model';
import { loadStatusBarItems } from '../../state/status-bar';

interface MockConfigItem {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  color?: 'default' | 'warning' | 'error' | 'success';
  clickable: boolean;
  commandId?: string;
  position?: 'left' | 'right';
}

interface MockConfig {
  items: MockConfigItem[];
}

@Injectable({ providedIn: 'root' })
export class MockConfigLoader {
  private readonly store = inject(Store);

  async load(): Promise<void> {
    try {
      const response = await fetch('assets/config/status-bar-mocks.json');
      if (!response.ok) {
        console.warn('[MockConfigLoader] Mock configuration file not found or inaccessible');
        return;
      }

      const config: MockConfig = await response.json();
      const items = this.parseItems(config.items);
      this.store.dispatch(loadStatusBarItems({ items }));
    } catch (err) {
      console.error('[MockConfigLoader] Failed to load mock configuration:', err);
    }
  }

  private parseItems(rawItems: MockConfigItem[]): StatusBarItem[] {
    const seenIds = new Set<string>();
    const validItems: StatusBarItem[] = [];

    for (let i = 0; i < rawItems.length; i++) {
      const raw = rawItems[i];

      if (!raw.id || !raw.id.trim()) {
        console.warn(`[MockConfigLoader] Item at index ${i} skipped: missing or empty 'id'`);
        continue;
      }

      if (!raw.label || !raw.label.trim()) {
        console.warn(`[MockConfigLoader] Item '${raw.id}' skipped: missing or empty 'label'`);
        continue;
      }

      if (seenIds.has(raw.id)) {
        console.warn(`[MockConfigLoader] Duplicate item id '${raw.id}' skipped`);
        continue;
      }

      seenIds.add(raw.id);

      const color = this.validateColor(raw.color);

      validItems.push({
        id: raw.id,
        label: raw.label,
        icon: raw.icon,
        tooltip: raw.tooltip,
        color,
        clickable: !!raw.clickable,
        commandId: raw.commandId,
        position: raw.position ?? 'left',
      } as StatusBarItem);
    }

    return validItems;
  }

  private validateColor(color: string | undefined): 'default' | 'warning' | 'error' | 'success' {
    const validColors = ['default', 'warning', 'error', 'success'];
    if (color && validColors.includes(color)) {
      return color as 'default' | 'warning' | 'error' | 'success';
    }
    if (color) {
      console.warn(`[MockConfigLoader] Invalid color '${color}', falling back to 'default'`);
    }
    return 'default';
  }
}
