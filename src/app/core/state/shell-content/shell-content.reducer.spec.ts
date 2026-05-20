import { Action } from '@ngrx/store';
import {
  addShellTab,
  addSecondaryPanelEntry,
  setActiveSecondaryPanelEntry,
} from './shell-content.actions';
import { shellContentReducer, initialShellContentState } from './shell-content.reducer';
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

describe('shellContentReducer secondary panel behavior', () => {
  it('should default active entry to weather when weather and market entries are present', () => {
    const state1 = shellContentReducer(
      initialShellContentState,
      addSecondaryPanelEntry({ entry: { id: 'secondary-market', label: 'Market', component: MarketComp } })
    );
    const state2 = shellContentReducer(
      state1,
      addSecondaryPanelEntry({ entry: { id: 'secondary-weather', label: 'Weather', component: WeatherComp } })
    );

    expect(state2.activeSecondaryPanelEntryId).toBe('secondary-weather');
  });

  it('should fallback to first available entry when setting invalid active entry id', () => {
    const withEntries = shellContentReducer(
      shellContentReducer(
        initialShellContentState,
        addSecondaryPanelEntry({ entry: { id: 'secondary-weather', label: 'Weather', component: WeatherComp } })
      ),
      addSecondaryPanelEntry({ entry: { id: 'secondary-market', label: 'Market', component: MarketComp } })
    );

    const fallbackState = shellContentReducer(
      withEntries,
      setActiveSecondaryPanelEntry({ id: 'missing-entry' })
    );

    expect(fallbackState.activeSecondaryPanelEntryId).toBe('secondary-weather');
  });

  it('should keep active secondary entry null when no entries exist', () => {
    const state = shellContentReducer(
      initialShellContentState,
      setActiveSecondaryPanelEntry({ id: 'missing-entry' })
    );

    expect(state.activeSecondaryPanelEntryId).toBeNull();
    expect(state.secondaryPanelEntries.length).toBe(0);
  });

  it('should ignore duplicate secondary entry ids', () => {
    const state = shellContentReducer(
      shellContentReducer(
        initialShellContentState,
        addSecondaryPanelEntry({ entry: { id: 'secondary-weather', label: 'Weather', component: WeatherComp } })
      ),
      addSecondaryPanelEntry({ entry: { id: 'secondary-weather', label: 'Weather duplicate', component: WeatherComp } })
    );

    expect(state.secondaryPanelEntries.length).toBe(1);
  });

  it('should be a valid reducer function', () => {
    const state = shellContentReducer(undefined, { type: 'UNKNOWN' } as Action);
    expect(state).toEqual(initialShellContentState);
  });
});

describe('shellContentReducer tab guard support', () => {
  it('should store the guard alongside tabItem and componentType', () => {
    const guard: TabCloseGuard = { beforeClose: () => false };
    const tabItem = makeTabItem('editor', 'Editor');
    const state = shellContentReducer(
      initialShellContentState,
      addShellTab({ tabItem, componentType: MockTabComp, guard })
    );

    expect(state.tabs.length).toBe(1);
    expect(state.tabs[0].guard).toBe(guard);
    expect(state.tabs[0].tabItem.id).toBe('editor');
    expect(state.tabs[0].componentType).toBe(MockTabComp);
  });

  it('should store undefined guard when no guard is provided', () => {
    const tabItem = makeTabItem('dashboard', 'Dashboard');
    const state = shellContentReducer(
      initialShellContentState,
      addShellTab({ tabItem, componentType: MockTabComp })
    );

    expect(state.tabs.length).toBe(1);
    expect(state.tabs[0].guard).toBeUndefined();
  });
});
