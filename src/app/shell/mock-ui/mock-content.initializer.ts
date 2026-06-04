import { DockZone } from '../../core/models/dock-zone-assignment.model';
import { ShellManager } from '../shell-manager.service';
import {
  MOCK_ALERT_ERROR,
  MOCK_ALERT_INFO,
  MOCK_ALERT_SUCCESS,
  MOCK_ALERT_WARNING,
  MOCK_DASHBOARD_TAB,
  MOCK_LOGS_PANEL,
  MOCK_NAV_SIDEBAR_ENTRY,
  MOCK_REPORTS_TAB,
  MOCK_RESULTS_PANEL,
  MOCK_SECONDARY_MARKET_ENTRY,
  MOCK_SECONDARY_WEATHER_ENTRY,
  MOCK_TOOLS_SIDEBAR_ENTRY,
  MOCK_WARNINGS_PANEL,
} from './mock-registrations';

export function registerMockContent(shell: ShellManager): void {

  shell.addTab(MOCK_DASHBOARD_TAB, DockZone.PrimaryTopLeftWorkspace);
  shell.addTab(MOCK_REPORTS_TAB, DockZone.PrimaryTopLeftWorkspace);

  shell.addSidebarEntry(MOCK_NAV_SIDEBAR_ENTRY);
  shell.addSidebarEntry(MOCK_TOOLS_SIDEBAR_ENTRY);

  shell.addToolbarAction(MOCK_ALERT_INFO);
  shell.addToolbarAction(MOCK_ALERT_WARNING);
  shell.addToolbarAction(MOCK_ALERT_ERROR);
  shell.addToolbarAction(MOCK_ALERT_SUCCESS);

  shell.addTab(MOCK_RESULTS_PANEL, DockZone.BottomLeftPanel);
  shell.addTab(MOCK_LOGS_PANEL, DockZone.BottomCenterPanel);
  shell.addTab(MOCK_WARNINGS_PANEL, DockZone.BottomRightPanel);

  shell.addTab(MOCK_SECONDARY_WEATHER_ENTRY, DockZone.SecondaryPanel);
  shell.addTab(MOCK_SECONDARY_MARKET_ENTRY, DockZone.SecondaryPanel);

  shell.setBottomPanelVisible(true);
  shell.setSecondaryPanelVisible(true);
}
