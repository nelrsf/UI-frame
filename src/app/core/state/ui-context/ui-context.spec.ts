import {
  uiContextReducer,
  initialUiContextState,
  UiContextState,
  BreadcrumbItem,
  StatusBarItem,
} from './ui-context.reducer';
import {
  setBreadcrumbs,
  setStatusItems,
  setAvailableActions,
} from './ui-context.actions';
import {
  selectBreadcrumbs,
  selectStatusItems,
  selectAvailableActions,
} from './ui-context.selectors';

describe('uiContext reducer', () => {
  it('should return the initial state for unknown actions', () => {
    const state = uiContextReducer(undefined, { type: '__unknown__' });
    expect(state).toEqual(initialUiContextState);
  });

  describe('setBreadcrumbs', () => {
    it('should replace the breadcrumbs with the supplied items', () => {
      const crumbs: BreadcrumbItem[] = [
        { id: 'home', label: 'Home' },
        { id: 'src', label: 'src', url: '/src' },
      ];
      const state = uiContextReducer(initialUiContextState, setBreadcrumbs({ breadcrumbs: crumbs }));
      expect(state.breadcrumbs).toEqual(crumbs);
    });

    it('should clear the breadcrumbs when an empty array is passed', () => {
      const withCrumbs: UiContextState = {
        ...initialUiContextState,
        breadcrumbs: [{ id: 'x', label: 'X' }],
      };
      const state = uiContextReducer(withCrumbs, setBreadcrumbs({ breadcrumbs: [] }));
      expect(state.breadcrumbs).toEqual([]);
    });

    it('should not affect statusItems or availableActions', () => {
      const state = uiContextReducer(
        initialUiContextState,
        setBreadcrumbs({ breadcrumbs: [{ id: 'a', label: 'A' }] })
      );
      expect(state.statusItems).toEqual([]);
      expect(state.availableActions).toEqual([]);
    });
  });

  describe('setStatusItems', () => {
    it('should replace status items with the supplied list', () => {
      const items: StatusBarItem[] = [
        { id: 'branch', label: 'main', alignment: 'left' },
        { id: 'errors', label: '0 errors', alignment: 'right', tooltip: 'No problems' },
      ];
      const state = uiContextReducer(initialUiContextState, setStatusItems({ items }));
      expect(state.statusItems).toEqual(items);
    });

    it('should clear status items when an empty array is passed', () => {
      const withItems: UiContextState = {
        ...initialUiContextState,
        statusItems: [{ id: 'x', label: 'X', alignment: 'left' }],
      };
      const state = uiContextReducer(withItems, setStatusItems({ items: [] }));
      expect(state.statusItems).toEqual([]);
    });

    it('should not affect breadcrumbs or availableActions', () => {
      const state = uiContextReducer(
        initialUiContextState,
        setStatusItems({ items: [{ id: 'z', label: 'Z', alignment: 'right' }] })
      );
      expect(state.breadcrumbs).toEqual([]);
      expect(state.availableActions).toEqual([]);
    });
  });

  describe('setAvailableActions', () => {
    it('should replace availableActions with the supplied command IDs', () => {
      const state = uiContextReducer(
        initialUiContextState,
        setAvailableActions({ actions: ['save', 'undo', 'redo'] })
      );
      expect(state.availableActions).toEqual(['save', 'undo', 'redo']);
    });

    it('should clear available actions when an empty array is passed', () => {
      const withActions: UiContextState = {
        ...initialUiContextState,
        availableActions: ['save'],
      };
      const state = uiContextReducer(withActions, setAvailableActions({ actions: [] }));
      expect(state.availableActions).toEqual([]);
    });

    it('should not affect breadcrumbs or statusItems', () => {
      const state = uiContextReducer(
        initialUiContextState,
        setAvailableActions({ actions: ['cmd1'] })
      );
      expect(state.breadcrumbs).toEqual([]);
      expect(state.statusItems).toEqual([]);
    });
  });
});

describe('uiContext selectors', () => {
  const state: { uiContext: UiContextState } = {
    uiContext: {
      breadcrumbs: [{ id: 'root', label: 'Root' }],
      statusItems: [{ id: 'branch', label: 'main', alignment: 'left' }],
      availableActions: ['save', 'close'],
    },
  };

  it('selectBreadcrumbs should return the breadcrumbs', () => {
    expect(selectBreadcrumbs(state)).toEqual([{ id: 'root', label: 'Root' }]);
  });

  it('selectStatusItems should return the status items', () => {
    expect(selectStatusItems(state)).toEqual([
      { id: 'branch', label: 'main', alignment: 'left' },
    ]);
  });

  it('selectAvailableActions should return the available action IDs', () => {
    expect(selectAvailableActions(state)).toEqual(['save', 'close']);
  });
});
