import { Action } from '@ngrx/store';
import {
  addSecondaryPanelEntry,
  setActiveSecondaryPanelEntry,
} from './shell-content.actions';
import { shellContentReducer, initialShellContentState } from './shell-content.reducer';

class WeatherComp {}
class MarketComp {}

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
