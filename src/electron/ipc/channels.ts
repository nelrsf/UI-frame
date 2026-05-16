/**
 * Centralized IPC channel name constants.
 *
 * Every channel used by preload and main MUST be declared here.  String
 * literals are never repeated across the codebase — all call sites import
 * from this module so that a rename is a single-point change.
 */

/**
 * URL protocols permitted by `shell:openExternal`.
 *
 * Validated at BOTH the sender (preload) and the handler (main) boundary per
 * the least-privilege security policy.  All other protocols are silently
 * denied.
 */
export const ALLOWED_EXTERNAL_PROTOCOLS: readonly string[] = ['https:', 'http:'];

export const IPC_CHANNELS = {
  WINDOW: {
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close',
    IS_MAXIMIZED: 'window:isMaximized',
  },
  SHELL: {
    OPEN_EXTERNAL: 'shell:openExternal',
  },
  PREFERENCES: {
    GET: 'preferences:get',
    SET: 'preferences:set',
  },
  MENU: {
    TOGGLE_BOTTOM_PANEL: 'menu:toggleBottomPanel',
    TOGGLE_SECONDARY_PANEL: 'menu:toggleSecondaryPanel',
    THEME_CHANGED: 'menu:themeChanged',
    UPDATE_PANEL_STATE: 'menu:updatePanelState',
  },
} as const;

/** Union of every valid IPC channel string. */
export type IpcChannel =
  | (typeof IPC_CHANNELS.WINDOW)[keyof typeof IPC_CHANNELS.WINDOW]
  | (typeof IPC_CHANNELS.SHELL)[keyof typeof IPC_CHANNELS.SHELL]
  | (typeof IPC_CHANNELS.PREFERENCES)[keyof typeof IPC_CHANNELS.PREFERENCES]
  | (typeof IPC_CHANNELS.MENU)[keyof typeof IPC_CHANNELS.MENU];
