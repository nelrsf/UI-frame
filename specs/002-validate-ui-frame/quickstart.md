# Quickstart: ShellManager — Adding Content to the UI Frame Shell

**Feature**: 002-validate-ui-frame  
**Date**: 2026-05-04

This guide shows any domain developer how to register content in the UI Frame
shell without touching the shell source code.

---

## Prerequisites

- Angular 19 standalone component
- Access to `ShellManager` service (auto-provided at root level)
- Contracts barrel: `src/app/shell/contracts/index.ts`

---

## 1. Add a Tab (Central Region)

```typescript
import { Injectable, Type } from '@angular/core';
import { ICentralRegionTab } from 'src/app/shell/contracts';
import { ShellManager } from 'src/app/shell/shell-manager.service';
import { WeatherDashboardComponent } from './weather-dashboard.component';

// Implement the contract
const weatherTab: ICentralRegionTab = {
  id: 'weather-main',
  label: 'Weather',
  component: WeatherDashboardComponent,
  closable: false,
  icon: 'cloud',
};

// Register via ShellManager (e.g., in APP_INITIALIZER)
export function registerWeatherContent(shell: ShellManager): void {
  shell.addTab(weatherTab);
}
```

The tab will appear in the shell's tab bar. When the user clicks it, the shell
renders `WeatherDashboardComponent` using `NgComponentOutlet` — no imports of
`WeatherDashboardComponent` are needed anywhere in the shell.

---

## 2. Add a Sidebar Entry

```typescript
import { ISidebarEntry } from 'src/app/shell/contracts';

const weatherEntry: ISidebarEntry = {
  id: 'weather-nav',
  label: 'Weather',
  icon: 'cloud',               // Material icon ligature or CSS class
  tooltip: 'Open Weather module',
};

shell.addSidebarEntry(weatherEntry);
```

---

## 3. Add a Toolbar Action

```typescript
import { IToolbarAction } from 'src/app/shell/contracts';

const refreshAction: IToolbarAction = {
  id: 'weather-refresh',
  label: 'Refresh',
  icon: 'refresh',
  handler: () => weatherService.refresh(),   // any synchronous () => void
  tooltip: 'Refresh weather data',
};

shell.addToolbarAction(refreshAction);
```

When the user clicks "Refresh" in the toolbar, the shell calls
`CommandRegistry.execute('shell.action.weather-refresh')`, which invokes your
handler. Exceptions are caught — the shell will not crash.

---

## 4. Add a Bottom Panel Entry

```typescript
import { IBottomPanelEntry } from 'src/app/shell/contracts';

const outputPanel: IBottomPanelEntry = {
  id: 'weather-output',
  label: 'Weather Output',
  icon: 'terminal',
};

shell.addBottomPanelEntry(outputPanel);
```

---

## 5. Bootstrap via `APP_INITIALIZER` (recommended)

Register your content before the first render by providing an `APP_INITIALIZER`
in `app.config.ts`:

```typescript
import { APP_INITIALIZER } from '@angular/core';
import { ShellManager } from 'src/app/shell/shell-manager.service';

export function myAppInitializer(shell: ShellManager): () => void {
  return () => {
    shell.addTab(weatherTab);
    shell.addSidebarEntry(weatherEntry);
    shell.addToolbarAction(refreshAction);
    shell.addBottomPanelEntry(outputPanel);
  };
}

// In app.config.ts providers:
{
  provide: APP_INITIALIZER,
  useFactory: myAppInitializer,
  deps: [ShellManager],
  multi: true,
}
```

---

## 6. Mock Reference Implementations

The `src/app/shell/mock-ui/` folder contains reference implementations for
each contract that can be used during development:

| Mock | Contract | Description |
|------|----------|-------------|
| `MOCK_DASHBOARD_TAB` | `ICentralRegionTab` | Dashboard tab with fake KPI cards |
| `MOCK_REPORTS_TAB` | `ICentralRegionTab` | Reports tab with fake row data |
| `MOCK_ALERT_INFO`, `MOCK_ALERT_WARNING`, `MOCK_ALERT_ERROR`, `MOCK_ALERT_SUCCESS` | `IToolbarAction` | Buttons that fire `window.alert` |
| `MOCK_SIDEBAR_ENTRY` | `ISidebarEntry` | Navigation entry (fake) |
| `MOCK_RESULTS_PANEL` | `IBottomPanelEntry` | Results panel with fake data |

These are registered via `src/app/shell/mock-ui/mock-content.initializer.ts`,
which is wired in `app.config.ts` as an `APP_INITIALIZER`.

---

## 7. Duplicate ID Policy

If you call `shell.addTab({ id: 'my-tab', ... })` and a tab with `id = 'my-tab'`
already exists, the second call is **silently ignored**. A `console.warn` is
emitted in development mode. Ensure IDs are unique across all domain modules.

---

## Domain Examples

| Domain | Tab id | Action id | Notes |
|--------|--------|-----------|-------|
| Weather | `'weather-main'` | `'weather-refresh'` | Live data tab |
| Stock Exchange | `'stocks-main'` | `'stocks-buy'`, `'stocks-sell'` | Multiple actions |
| Reports | `'reports-main'` | `'reports-export'` | Export to PDF action |

All domains use the same `ShellManager` API. The shell source code is never
modified to accommodate new domains.
