import {
  layoutReducer,
  initialLayoutState,
  LayoutState,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_DEFAULT,
  BOTTOM_PANEL_HEIGHT_MIN,
  BOTTOM_PANEL_HEIGHT_MAX,
  BOTTOM_PANEL_HEIGHT_DEFAULT,
} from './layout.reducer';
import {
  toggleSidebar,
  setSidebarWidth,
  toggleBottomPanel,
  setBottomPanelHeight,
  setActiveSidebarItem,
} from './layout.actions';
import {
  selectSidebarVisible,
  selectSidebarWidth,
  selectBottomPanelVisible,
  selectBottomPanelHeight,
  selectActiveSidebarItem,
  selectLayoutSnapshot,
} from './layout.selectors';

describe('layout reducer', () => {
  it('should return the initial state for unknown actions', () => {
    const state = layoutReducer(undefined, { type: '__unknown__' });
    expect(state).toEqual(initialLayoutState);
  });

  describe('toggleSidebar', () => {
    it('should hide the sidebar when it is visible', () => {
      const state = layoutReducer(initialLayoutState, toggleSidebar());
      expect(state.sidebarVisible).toBeFalse();
    });

    it('should show the sidebar when it is hidden', () => {
      const hidden = { ...initialLayoutState, sidebarVisible: false };
      const state = layoutReducer(hidden, toggleSidebar());
      expect(state.sidebarVisible).toBeTrue();
    });

    it('should not affect other layout properties', () => {
      const state = layoutReducer(initialLayoutState, toggleSidebar());
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_DEFAULT);
      expect(state.bottomPanelVisible).toBeFalse();
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_DEFAULT);
      expect(state.activeSidebarItem).toBeNull();
    });
  });

  describe('setSidebarWidth', () => {
    it('should set a valid width within bounds', () => {
      const state = layoutReducer(initialLayoutState, setSidebarWidth({ width: 300 }));
      expect(state.sidebarWidth).toBe(300);
    });

    it('should clamp to SIDEBAR_WIDTH_MIN when width is too small', () => {
      const state = layoutReducer(initialLayoutState, setSidebarWidth({ width: 50 }));
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_MIN);
    });

    it('should clamp to SIDEBAR_WIDTH_MAX when width is too large', () => {
      const state = layoutReducer(initialLayoutState, setSidebarWidth({ width: 9999 }));
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_MAX);
    });

    it('should accept SIDEBAR_WIDTH_MIN exactly', () => {
      const state = layoutReducer(initialLayoutState, setSidebarWidth({ width: SIDEBAR_WIDTH_MIN }));
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_MIN);
    });

    it('should accept SIDEBAR_WIDTH_MAX exactly', () => {
      const state = layoutReducer(initialLayoutState, setSidebarWidth({ width: SIDEBAR_WIDTH_MAX }));
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_MAX);
    });
  });

  describe('toggleBottomPanel', () => {
    it('should show the bottom panel when it is hidden', () => {
      const state = layoutReducer(initialLayoutState, toggleBottomPanel());
      expect(state.bottomPanelVisible).toBeTrue();
    });

    it('should hide the bottom panel when it is visible', () => {
      const shown = { ...initialLayoutState, bottomPanelVisible: true };
      const state = layoutReducer(shown, toggleBottomPanel());
      expect(state.bottomPanelVisible).toBeFalse();
    });

    it('should not affect other layout properties', () => {
      const state = layoutReducer(initialLayoutState, toggleBottomPanel());
      expect(state.sidebarVisible).toBeTrue();
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_DEFAULT);
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_DEFAULT);
    });
  });

  describe('setBottomPanelHeight', () => {
    it('should set a valid height within bounds', () => {
      const state = layoutReducer(initialLayoutState, setBottomPanelHeight({ height: 300 }));
      expect(state.bottomPanelHeight).toBe(300);
    });

    it('should clamp to BOTTOM_PANEL_HEIGHT_MIN when height is too small', () => {
      const state = layoutReducer(initialLayoutState, setBottomPanelHeight({ height: 10 }));
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_MIN);
    });

    it('should clamp to BOTTOM_PANEL_HEIGHT_MAX when height is too large', () => {
      const state = layoutReducer(initialLayoutState, setBottomPanelHeight({ height: 9999 }));
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_MAX);
    });

    it('should accept BOTTOM_PANEL_HEIGHT_MIN exactly', () => {
      const state = layoutReducer(
        initialLayoutState,
        setBottomPanelHeight({ height: BOTTOM_PANEL_HEIGHT_MIN })
      );
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_MIN);
    });

    it('should accept BOTTOM_PANEL_HEIGHT_MAX exactly', () => {
      const state = layoutReducer(
        initialLayoutState,
        setBottomPanelHeight({ height: BOTTOM_PANEL_HEIGHT_MAX })
      );
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_MAX);
    });
  });

  describe('setActiveSidebarItem', () => {
    it('should set the active sidebar item', () => {
      const state = layoutReducer(initialLayoutState, setActiveSidebarItem({ itemId: 'explorer' }));
      expect(state.activeSidebarItem).toBe('explorer');
    });

    it('should clear the active sidebar item when null is passed', () => {
      const withItem = { ...initialLayoutState, activeSidebarItem: 'search' };
      const state = layoutReducer(withItem, setActiveSidebarItem({ itemId: null }));
      expect(state.activeSidebarItem).toBeNull();
    });

    it('should not affect other layout properties', () => {
      const state = layoutReducer(
        initialLayoutState,
        setActiveSidebarItem({ itemId: 'scm' })
      );
      expect(state.sidebarVisible).toBeTrue();
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_DEFAULT);
      expect(state.bottomPanelVisible).toBeFalse();
    });
  });
});

describe('layout selectors', () => {
  const state: { layout: LayoutState } = {
    layout: {
      sidebarVisible: false,
      sidebarWidth: 300,
      bottomPanelVisible: true,
      bottomPanelHeight: 250,
      activeSidebarItem: 'explorer',
    },
  };

  it('selectSidebarVisible should return the sidebarVisible flag', () => {
    expect(selectSidebarVisible(state)).toBeFalse();
  });

  it('selectSidebarWidth should return the sidebarWidth', () => {
    expect(selectSidebarWidth(state)).toBe(300);
  });

  it('selectBottomPanelVisible should return the bottomPanelVisible flag', () => {
    expect(selectBottomPanelVisible(state)).toBeTrue();
  });

  it('selectBottomPanelHeight should return the bottomPanelHeight', () => {
    expect(selectBottomPanelHeight(state)).toBe(250);
  });

  it('selectActiveSidebarItem should return the activeSidebarItem', () => {
    expect(selectActiveSidebarItem(state)).toBe('explorer');
  });

  it('selectLayoutSnapshot should return a full layout snapshot', () => {
    expect(selectLayoutSnapshot(state)).toEqual({
      sidebarVisible: false,
      sidebarWidth: 300,
      bottomPanelVisible: true,
      bottomPanelHeight: 250,
      activeSidebarItem: 'explorer',
    });
  });
});
