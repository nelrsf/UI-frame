import { ShellManager } from '../shell-manager.service';
import {
  MOCK_ALERT_ERROR,
  MOCK_ALERT_INFO,
  MOCK_ALERT_SUCCESS,
  MOCK_ALERT_WARNING,
  MOCK_DASHBOARD_TAB,
  MOCK_REPORTS_TAB,
  MOCK_RESULTS_PANEL,
  MOCK_SIDEBAR_ENTRY,
} from './mock-registrations';

export function registerMockContent(shell: ShellManager): void {

  shell.addTab(MOCK_DASHBOARD_TAB);
  shell.addTab(MOCK_REPORTS_TAB);

  shell.addSidebarEntry(MOCK_SIDEBAR_ENTRY);

  shell.addToolbarAction(MOCK_ALERT_INFO);
  shell.addToolbarAction(MOCK_ALERT_WARNING);
  shell.addToolbarAction(MOCK_ALERT_ERROR);
  shell.addToolbarAction(MOCK_ALERT_SUCCESS);

  shell.addBottomPanelEntry(MOCK_RESULTS_PANEL);
    shell.setBottomPanelVisible(true);
}
