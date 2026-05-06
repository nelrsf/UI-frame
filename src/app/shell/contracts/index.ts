/**
 * Public region contracts for the UI Frame shell.
 *
 * These interfaces define the public API for domain applications to register
 * content in the shell's regions (tabs, sidebar, toolbar, bottom panel) without
 * any knowledge of shell internals or DTOs.
 *
 * Usage:
 * ```
 * import { ICentralRegionTab, ISidebarEntry, IToolbarAction, IBottomPanelEntry } from '@app/shell/contracts';
 * ```
 */

export type { ICentralRegionTab } from './ICentralRegionTab';
export type { ISidebarEntry } from './ISidebarEntry';
export type { IToolbarAction } from './IToolbarAction';
export type { IBottomPanelEntry } from './IBottomPanelEntry';
export type { ISecondaryPanelEntry } from './ISecondaryPanelEntry';
