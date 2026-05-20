import {
  selectActiveSecondaryPanelComponentType,
  selectActiveSecondaryPanelEntryId,
  selectShellCloseGuards,
  selectShellSecondaryPanelEntries,
} from './shell-content.selectors';
import { ShellContentState } from './shell-content.reducer';
import { TabCloseGuard, TabItem } from '../../../shell/models/tab-item.model';

class WeatherComp {}
class MarketComp {}
class MockTabComp {}

const makeTabItem = (id: string, label: string): TabItem => ({
  id,
  label,
  closable: true,
  dirty: false,
  pinned: false,
  groupId: 'main',
});

describe('shell-content selectors for secondary panel', () => {
  const state: { shellContent: ShellContentState } = {
    shellContent: {
      tabs: [],
      activeShellTabId: null,
      sidebarItems: [],
      toolbarActions: [],
      bottomPanelTabs: [],
      secondaryPanelEntries: [
        { id: 'secondary-weather', label: 'Weather', component: WeatherComp },
        { id: 'secondary-market', label: 'Market', component: MarketComp },
      ],
      activeSecondaryPanelEntryId: 'secondary-market',
    },
  };

  it('should select all secondary panel entries', () => {
    const entries = selectShellSecondaryPanelEntries(state);
    expect(entries.length).toBe(2);
    expect(entries[0].id).toBe('secondary-weather');
  });

  it('should select active secondary panel entry id', () => {
    const activeId = selectActiveSecondaryPanelEntryId(state);
    expect(activeId).toBe('secondary-market');
  });

  it('should select active secondary panel component type', () => {
    const componentType = selectActiveSecondaryPanelComponentType(state);
    expect(componentType).toBe(MarketComp);
  });

  it('should return null active component when active id is missing', () => {
    const missingActive = {
      shellContent: {
        ...state.shellContent,
        activeSecondaryPanelEntryId: 'missing',
      },
    };

    expect(selectActiveSecondaryPanelComponentType(missingActive)).toBeNull();
  });
});

describe('selectShellCloseGuards', () => {
  it('should return an empty record when no tabs have guards', () => {
    const testState: { shellContent: ShellContentState } = {
      shellContent: {
        tabs: [
          { tabItem: makeTabItem('tab-1', 'Dashboard'), componentType: MockTabComp },
          { tabItem: makeTabItem('tab-2', 'Reports'), componentType: MockTabComp },
        ],
        activeShellTabId: 'tab-1',
        sidebarItems: [],
        toolbarActions: [],
        bottomPanelTabs: [],
        secondaryPanelEntries: [],
        activeSecondaryPanelEntryId: null,
      },
    };

    const guards = selectShellCloseGuards(testState);
    expect(Object.keys(guards).length).toBe(0);
  });

  it('should map tab IDs to their guards for tabs with guards', () => {
    const guard1: TabCloseGuard = { beforeClose: () => true };
    const guard2: TabCloseGuard = { beforeClose: () => false };
    const testState: { shellContent: ShellContentState } = {
      shellContent: {
        tabs: [
          { tabItem: makeTabItem('tab-1', 'Dashboard'), componentType: MockTabComp, guard: guard1 },
          { tabItem: makeTabItem('tab-2', 'Reports'), componentType: MockTabComp },
          { tabItem: makeTabItem('tab-3', 'Editor'), componentType: MockTabComp, guard: guard2 },
        ],
        activeShellTabId: 'tab-1',
        sidebarItems: [],
        toolbarActions: [],
        bottomPanelTabs: [],
        secondaryPanelEntries: [],
        activeSecondaryPanelEntryId: null,
      },
    };

    const guards = selectShellCloseGuards(testState);
    expect(Object.keys(guards).length).toBe(2);
    expect(guards['tab-1']).toBe(guard1);
    expect(guards['tab-3']).toBe(guard2);
    expect(guards['tab-2']).toBeUndefined();
  });

  it('should return an empty record when no tabs exist', () => {
    const testState: { shellContent: ShellContentState } = {
      shellContent: {
        tabs: [],
        activeShellTabId: null,
        sidebarItems: [],
        toolbarActions: [],
        bottomPanelTabs: [],
        secondaryPanelEntries: [],
        activeSecondaryPanelEntryId: null,
      },
    };

    const guards = selectShellCloseGuards(testState);
    expect(guards).toEqual({});
  });
});
