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
  SECONDARY_PANEL_WIDTH_MIN,
  SECONDARY_PANEL_WIDTH_MAX,
  SECONDARY_PANEL_WIDTH_DEFAULT,
} from './layout.reducer';
import {
  toggleSidebar,
  setSidebarWidth,
  toggleBottomPanel,
  setBottomPanelHeight,
  setActiveSidebarItem,
  toggleSecondaryPanel,
  setSecondaryPanelWidth,
  restoreLayout,
} from './layout.actions';
import {
  selectSidebarVisible,
  selectSidebarWidth,
  selectBottomPanelVisible,
  selectBottomPanelHeight,
  selectActiveSidebarItem,
  selectSecondaryPanelVisible,
  selectSecondaryPanelWidth,
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

  describe('toggleSecondaryPanel', () => {
    it('should show the secondary panel when it is hidden', () => {
      const state = layoutReducer(initialLayoutState, toggleSecondaryPanel());
      expect(state.secondaryPanelVisible).toBeTrue();
    });

    it('should hide the secondary panel when it is visible', () => {
      const shown = { ...initialLayoutState, secondaryPanelVisible: true };
      const state = layoutReducer(shown, toggleSecondaryPanel());
      expect(state.secondaryPanelVisible).toBeFalse();
    });

    it('should not affect other layout properties', () => {
      const state = layoutReducer(initialLayoutState, toggleSecondaryPanel());
      expect(state.sidebarVisible).toBeTrue();
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_DEFAULT);
      expect(state.bottomPanelVisible).toBeFalse();
    });
  });

  describe('setSecondaryPanelWidth', () => {
    it('should set a valid width within bounds', () => {
      const state = layoutReducer(initialLayoutState, setSecondaryPanelWidth({ width: 350 }));
      expect(state.secondaryPanelWidth).toBe(350);
    });

    it('should clamp to SECONDARY_PANEL_WIDTH_MIN when width is too small', () => {
      const state = layoutReducer(initialLayoutState, setSecondaryPanelWidth({ width: 10 }));
      expect(state.secondaryPanelWidth).toBe(SECONDARY_PANEL_WIDTH_MIN);
    });

    it('should clamp to SECONDARY_PANEL_WIDTH_MAX when width is too large', () => {
      const state = layoutReducer(initialLayoutState, setSecondaryPanelWidth({ width: 9999 }));
      expect(state.secondaryPanelWidth).toBe(SECONDARY_PANEL_WIDTH_MAX);
    });

    it('should accept SECONDARY_PANEL_WIDTH_MIN exactly', () => {
      const state = layoutReducer(initialLayoutState, setSecondaryPanelWidth({ width: SECONDARY_PANEL_WIDTH_MIN }));
      expect(state.secondaryPanelWidth).toBe(SECONDARY_PANEL_WIDTH_MIN);
    });

    it('should accept SECONDARY_PANEL_WIDTH_MAX exactly', () => {
      const state = layoutReducer(initialLayoutState, setSecondaryPanelWidth({ width: SECONDARY_PANEL_WIDTH_MAX }));
      expect(state.secondaryPanelWidth).toBe(SECONDARY_PANEL_WIDTH_MAX);
    });
  });

  describe('restoreLayout', () => {
    const restorePayload = {
      sidebarVisible: false,
      sidebarWidth: 320,
      bottomPanelVisible: true,
      bottomPanelHeight: 280,
      secondaryPanelVisible: true,
      secondaryPanelWidth: 400,
    };
    const restoredAction = restoreLayout(restorePayload);

    it('should restore sidebarVisible', () => {
      const state = layoutReducer(initialLayoutState, restoredAction);
      expect(state.sidebarVisible).toBeFalse();
    });

    it('should restore sidebarWidth within bounds', () => {
      const state = layoutReducer(initialLayoutState, restoredAction);
      expect(state.sidebarWidth).toBe(320);
    });

    it('should restore bottomPanelVisible', () => {
      const state = layoutReducer(initialLayoutState, restoredAction);
      expect(state.bottomPanelVisible).toBeTrue();
    });

    it('should restore bottomPanelHeight within bounds', () => {
      const state = layoutReducer(initialLayoutState, restoredAction);
      expect(state.bottomPanelHeight).toBe(280);
    });

    it('should restore secondaryPanelVisible', () => {
      const state = layoutReducer(initialLayoutState, restoredAction);
      expect(state.secondaryPanelVisible).toBeTrue();
    });

    it('should restore secondaryPanelWidth within bounds', () => {
      const state = layoutReducer(initialLayoutState, restoredAction);
      expect(state.secondaryPanelWidth).toBe(400);
    });

    it('should clamp sidebarWidth to SIDEBAR_WIDTH_MIN when below minimum', () => {
      const action = restoreLayout({ ...restorePayload, sidebarWidth: 10 });
      const state = layoutReducer(initialLayoutState, action);
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_MIN);
    });

    it('should clamp sidebarWidth to SIDEBAR_WIDTH_MAX when above maximum', () => {
      const action = restoreLayout({ ...restorePayload, sidebarWidth: 9999 });
      const state = layoutReducer(initialLayoutState, action);
      expect(state.sidebarWidth).toBe(SIDEBAR_WIDTH_MAX);
    });

    it('should clamp bottomPanelHeight to BOTTOM_PANEL_HEIGHT_MIN when below minimum', () => {
      const action = restoreLayout({ ...restorePayload, bottomPanelHeight: 1 });
      const state = layoutReducer(initialLayoutState, action);
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_MIN);
    });

    it('should clamp bottomPanelHeight to BOTTOM_PANEL_HEIGHT_MAX when above maximum', () => {
      const action = restoreLayout({ ...restorePayload, bottomPanelHeight: 9999 });
      const state = layoutReducer(initialLayoutState, action);
      expect(state.bottomPanelHeight).toBe(BOTTOM_PANEL_HEIGHT_MAX);
    });

    it('should clamp secondaryPanelWidth to SECONDARY_PANEL_WIDTH_MIN when below minimum', () => {
      const action = restoreLayout({ ...restorePayload, secondaryPanelWidth: 1 });
      const state = layoutReducer(initialLayoutState, action);
      expect(state.secondaryPanelWidth).toBe(SECONDARY_PANEL_WIDTH_MIN);
    });

    it('should clamp secondaryPanelWidth to SECONDARY_PANEL_WIDTH_MAX when above maximum', () => {
      const action = restoreLayout({ ...restorePayload, secondaryPanelWidth: 9999 });
      const state = layoutReducer(initialLayoutState, action);
      expect(state.secondaryPanelWidth).toBe(SECONDARY_PANEL_WIDTH_MAX);
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
      secondaryPanelVisible: true,
      secondaryPanelWidth: 350,
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

  it('selectSecondaryPanelVisible should return the secondaryPanelVisible flag', () => {
    expect(selectSecondaryPanelVisible(state)).toBeTrue();
  });

  it('selectSecondaryPanelWidth should return the secondaryPanelWidth', () => {
    expect(selectSecondaryPanelWidth(state)).toBe(350);
  });

  it('selectLayoutSnapshot should return a full layout snapshot', () => {
    expect(selectLayoutSnapshot(state)).toEqual({
      sidebarVisible: false,
      sidebarWidth: 300,
      bottomPanelVisible: true,
      bottomPanelHeight: 250,
      activeSidebarItem: 'explorer',
      secondaryPanelVisible: true,
      secondaryPanelWidth: 350,
    });
  });
});
