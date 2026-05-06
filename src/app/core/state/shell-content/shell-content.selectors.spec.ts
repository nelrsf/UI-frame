import {
  selectActiveSecondaryPanelComponentType,
  selectActiveSecondaryPanelEntryId,
  selectShellSecondaryPanelEntries,
} from './shell-content.selectors';
import { ShellContentState } from './shell-content.reducer';

class WeatherComp {}
class MarketComp {}

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
