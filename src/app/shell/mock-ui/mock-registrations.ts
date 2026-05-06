import {
  IBottomPanelEntry,
  ICentralRegionTab,
  ISecondaryPanelEntry,
  ISidebarEntry,
  IToolbarAction,
} from '../contracts';
import {
  MOCK_DASHBOARD_CARDS,
  MOCK_REPORT_ROWS,
  MOCK_TOOLBAR_ALERTS,
} from './fixtures';
import { MockDashboardComponent } from './components/mock-dashboard/mock-dashboard.component';
import { MockReportsComponent } from './components/mock-reports/mock-reports.component';
import { MockNavSectionComponent } from './components/mock-sidebar/mock-nav-section.component';
import { MockToolsSectionComponent } from './components/mock-sidebar/mock-tools-section.component';
import { MockBottomLogsComponent } from './components/mock-bottom-panel/mock-bottom-logs.component';
import { MockBottomResultsComponent } from './components/mock-bottom-panel/mock-bottom-results.component';
import { MockBottomWarningsComponent } from './components/mock-bottom-panel/mock-bottom-warnings.component';
import { MockSecondaryWeatherComponent } from './components/mock-secondary-panel/mock-secondary-weather.component';
import { MockSecondaryMarketComponent } from './components/mock-secondary-panel/mock-secondary-market.component';

export const MOCK_DASHBOARD_TAB: ICentralRegionTab = {
  id: 'mock-dashboard',
  label: 'Dashboard',
  component: MockDashboardComponent,
  icon: '📄',
  closable: false,
};

export const MOCK_REPORTS_TAB: ICentralRegionTab = {
  id: 'mock-reports',
  label: 'Reports',
  component: MockReportsComponent,
  icon: '📊',
  closable: false,
};

export const MOCK_ALERT_INFO: IToolbarAction = {
  id: 'mock-alert-info',
  label: 'Info',
  icon: 'ℹ️',
  handler: () => window.alert(`INFO: ${MOCK_TOOLBAR_ALERTS[0].message}`),
  tooltip: 'Show info alert',
};

export const MOCK_ALERT_WARNING: IToolbarAction = {
  id: 'mock-alert-warning',
  label: 'Warning',
  icon: '⚠️',
  handler: () => window.alert(`WARNING: ${MOCK_TOOLBAR_ALERTS[1].message}`),
  tooltip: 'Show warning alert',
};

export const MOCK_ALERT_ERROR: IToolbarAction = {
  id: 'mock-alert-error',
  label: 'Error',
  icon: '❌',
  handler: () => window.alert(`ERROR: ${MOCK_TOOLBAR_ALERTS[2].message}`),
  tooltip: 'Show error alert',
};

export const MOCK_ALERT_SUCCESS: IToolbarAction = {
  id: 'mock-alert-success',
  label: 'Success',
  icon: '✅',
  handler: () => window.alert(`SUCCESS: ${MOCK_TOOLBAR_ALERTS[3].message}`),
  tooltip: 'Show success alert',
};

export const MOCK_NAV_SIDEBAR_ENTRY: ISidebarEntry = {
  id: 'mock-nav',
  label: 'Navigation',
  icon: '🗂️',
  component: MockNavSectionComponent,
  tooltip: 'Navigation section',
};

export const MOCK_TOOLS_SIDEBAR_ENTRY: ISidebarEntry = {
  id: 'mock-tools',
  label: 'Tools',
  icon: '🔧',
  component: MockToolsSectionComponent,
  tooltip: 'Tools section',
};

export const MOCK_RESULTS_PANEL: IBottomPanelEntry = {
  id: 'mock-results',
  label: `Results (${MOCK_REPORT_ROWS.length + MOCK_DASHBOARD_CARDS.length})`,
  icon: '✓',
  component: MockBottomResultsComponent,
};

export const MOCK_LOGS_PANEL: IBottomPanelEntry = {
  id: 'mock-logs',
  label: 'Logs',
  icon: '📄',
  component: MockBottomLogsComponent,
};

export const MOCK_WARNINGS_PANEL: IBottomPanelEntry = {
  id: 'mock-warnings',
  label: 'Warnings',
  icon: '⚠️',
  component: MockBottomWarningsComponent,
};

export const MOCK_SECONDARY_WEATHER_ENTRY: ISecondaryPanelEntry = {
  id: 'secondary-weather',
  label: 'Weather',
  icon: '☀️',
  component: MockSecondaryWeatherComponent,
};

export const MOCK_SECONDARY_MARKET_ENTRY: ISecondaryPanelEntry = {
  id: 'secondary-market',
  label: 'Market',
  icon: '📈',
  component: MockSecondaryMarketComponent,
};
