import { Action } from '@ngrx/store';
import {
  addSecondaryPanelEntry,
  addBottomPanelEntry,
  setActiveSecondaryPanelEntry,
  removeBottomPanelEntry,
  removeSecondaryPanelEntry,
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

describe('shellContentReducer remove behavior', () => {
  class TestComp {}

  describe('removeBottomPanelEntry', () => {
    it('should remove a bottom panel entry by id', () => {
      const state1 = shellContentReducer(
        initialShellContentState,
        addBottomPanelEntry({ id: 'problems', label: 'Problems', component: TestComp, closable: true })
      );
      const state2 = shellContentReducer(
        state1,
        addBottomPanelEntry({ id: 'output', label: 'Output', component: TestComp, closable: true })
      );

      const next = shellContentReducer(state2, removeBottomPanelEntry({ entryId: 'problems' }));

      expect(next.bottomPanelTabs.length).toBe(1);
      expect(next.bottomPanelTabs[0].id).toBe('output');
    });

    it('should be a no-op for a non-existent entry id', () => {
      const state = shellContentReducer(
        initialShellContentState,
        addBottomPanelEntry({ id: 'problems', label: 'Problems', component: TestComp, closable: true })
      );

      const next = shellContentReducer(state, removeBottomPanelEntry({ entryId: 'ghost' }));

      expect(next).toEqual(state);
    });

    it('should remove the only bottom panel entry', () => {
      const state = shellContentReducer(
        initialShellContentState,
        addBottomPanelEntry({ id: 'problems', label: 'Problems', component: TestComp, closable: true })
      );

      const next = shellContentReducer(state, removeBottomPanelEntry({ entryId: 'problems' }));

      expect(next.bottomPanelTabs.length).toBe(0);
    });
  });

  describe('removeSecondaryPanelEntry', () => {
    it('should remove a secondary panel entry by id', () => {
      const state1 = shellContentReducer(
        initialShellContentState,
        addSecondaryPanelEntry({ entry: { id: 'secondary-explorer', label: 'Explorer', component: TestComp } })
      );
      const state2 = shellContentReducer(
        state1,
        addSecondaryPanelEntry({ entry: { id: 'secondary-search', label: 'Search', component: TestComp } })
      );

      const next = shellContentReducer(state2, removeSecondaryPanelEntry({ entryId: 'secondary-explorer' }));

      expect(next.secondaryPanelEntries.length).toBe(1);
      expect(next.secondaryPanelEntries[0].id).toBe('secondary-search');
    });

    it('should fallback to default active entry when the active entry is removed', () => {
      const state1 = shellContentReducer(
        initialShellContentState,
        addSecondaryPanelEntry({ entry: { id: 'secondary-weather', label: 'Weather', component: TestComp } })
      );
      const state2 = shellContentReducer(
        state1,
        addSecondaryPanelEntry({ entry: { id: 'secondary-market', label: 'Market', component: TestComp } })
      );

      // weather is active by default
      expect(state2.activeSecondaryPanelEntryId).toBe('secondary-weather');

      const next = shellContentReducer(state2, removeSecondaryPanelEntry({ entryId: 'secondary-weather' }));

      expect(next.secondaryPanelEntries.length).toBe(1);
      expect(next.activeSecondaryPanelEntryId).toBe('secondary-market');
    });

    it('should be a no-op for a non-existent entry id', () => {
      const state = shellContentReducer(
        initialShellContentState,
        addSecondaryPanelEntry({ entry: { id: 'secondary-weather', label: 'Weather', component: TestComp } })
      );

      const next = shellContentReducer(state, removeSecondaryPanelEntry({ entryId: 'ghost' }));

      expect(next).toEqual(state);
    });

    it('should not change active entry when a non-active entry is removed', () => {
      const state1 = shellContentReducer(
        initialShellContentState,
        addSecondaryPanelEntry({ entry: { id: 'secondary-weather', label: 'Weather', component: TestComp } })
      );
      const state2 = shellContentReducer(
        state1,
        addSecondaryPanelEntry({ entry: { id: 'secondary-market', label: 'Market', component: TestComp } })
      );

      const next = shellContentReducer(state2, removeSecondaryPanelEntry({ entryId: 'secondary-market' }));

      expect(next.activeSecondaryPanelEntryId).toBe('secondary-weather');
    });
  });
});
