# Quickstart: ShellManager — Adding Content to the UI Frame Shell

**Feature**: 002-validate-ui-frame  
**Date**: 2026-05-04

This guide walks a domain developer through every step required to register
content in the UI Frame shell. You will never need to modify any file inside
`src/app/shell/`.

---

## How it works (mental model)

The shell exposes four **regions**. Each region has a contract interface:

| Region | Contract | Shell method |
|---|---|---|
| Tab bar (center) | `ICentralRegionTab` | `shell.addTab()` |
| Activity sidebar | `ISidebarEntry` | `shell.addSidebarEntry()` |
| Toolbar | `IToolbarAction` | `shell.addToolbarAction()` |
| Bottom panel | `IBottomPanelEntry` | `shell.addBottomPanelEntry()` |

You create objects that implement these interfaces, then hand them to
`ShellManager` **before the app renders** via Angular's `APP_INITIALIZER`.

The shell renders your components dynamically with `NgComponentOutlet` — it
never imports your types directly.

---

## Prerequisites

- Angular **19** standalone components (no `NgModule` required)
- Contracts barrel at `src/app/shell/contracts/index.ts`
- `ShellManager` is `providedIn: 'root'` — no extra module needed

---

## Files you will create

For a domain called `weather`, the recommended layout is:

```
src/app/weather/
  weather-dashboard.component.ts      ← tab content component
  weather-sidebar.component.ts        ← sidebar panel component
  weather-output-panel.component.ts   ← bottom panel component
  weather-registrations.ts            ← declares contract objects
  weather-content.initializer.ts      ← calls shell.add*() methods
```

`app.config.ts` already exists — you only add one provider block to it.

---

## Step 1 — Create your standalone components

Each region that renders a component (`ICentralRegionTab`, `ISidebarEntry`,
`IBottomPanelEntry`) requires an Angular **standalone** component.

```typescript
// src/app/weather/weather-dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `<p>Weather dashboard content here</p>`,
})
export class WeatherDashboardComponent {}
```

Repeat the same pattern for `WeatherSidebarComponent` and
`WeatherOutputPanelComponent`. The shell does not import these components —
you only import them in the registrations file (Step 2).

> `IToolbarAction` does **not** require a component — it uses a `handler`
> callback instead.

---

## Step 2 — Declare your contract objects (registrations file)

Create one file that exports a typed constant for each piece of content.
Import only contracts from the shell barrel and your own components.

```typescript
// src/app/weather/weather-registrations.ts
import {
  ICentralRegionTab,
  ISidebarEntry,
  IToolbarAction,
  IBottomPanelEntry,
} from 'src/app/shell/contracts';
import { WeatherDashboardComponent } from './weather-dashboard.component';
import { WeatherSidebarComponent } from './weather-sidebar.component';
import { WeatherOutputPanelComponent } from './weather-output-panel.component';

export const WEATHER_TAB: ICentralRegionTab = {
  id: 'weather-main',          // must be globally unique
  label: 'Weather',
  component: WeatherDashboardComponent,
  icon: 'cloud',
  closable: false,
};

export const WEATHER_SIDEBAR_ENTRY: ISidebarEntry = {
  id: 'weather-nav',
  label: 'Weather',
  icon: 'cloud',               // Material icon ligature or any CSS class
  component: WeatherSidebarComponent,
  tooltip: 'Open Weather module',
};

export const WEATHER_REFRESH_ACTION: IToolbarAction = {
  id: 'weather-refresh',
  label: 'Refresh',
  icon: 'refresh',
  handler: () => console.log('refresh triggered'),  // replace with real call
  tooltip: 'Refresh weather data',
};

export const WEATHER_OUTPUT_PANEL: IBottomPanelEntry = {
  id: 'weather-output',
  label: 'Weather Output',
  icon: 'cloud',
  component: WeatherOutputPanelComponent,
};
```

> **ID uniqueness** — if `shell.addTab({ id: 'weather-main', ... })` is called
> a second time, the call is silently ignored and a `console.warn` is emitted.
> Prefix all IDs with your domain name to avoid collisions.

---

## Step 3 — Create the initializer function

This function receives `ShellManager` and calls the registration methods in
the correct order.

```typescript
// src/app/weather/weather-content.initializer.ts
import { ShellManager } from 'src/app/shell/shell-manager.service';
import {
  WEATHER_TAB,
  WEATHER_SIDEBAR_ENTRY,
  WEATHER_REFRESH_ACTION,
  WEATHER_OUTPUT_PANEL,
} from './weather-registrations';

export function registerWeatherContent(shell: ShellManager): void {
  shell.addTab(WEATHER_TAB);
  shell.addSidebarEntry(WEATHER_SIDEBAR_ENTRY);
  shell.addToolbarAction(WEATHER_REFRESH_ACTION);
  shell.addBottomPanelEntry(WEATHER_OUTPUT_PANEL);

  // Call this only if you want the bottom panel to be visible on startup.
  // Remove if another domain or the mock already calls it.
  shell.setBottomPanelVisible(true);
}
```

---

## Step 4 — Write the Angular factory function

Angular's `APP_INITIALIZER` expects a **factory**: a function that receives
injected dependencies and returns a zero-argument callback. The factory is
what Angular DI will call at bootstrap time.

```typescript
// src/app/weather/weather-content.initializer.ts  (add to the same file)
import { ShellManager } from 'src/app/shell/shell-manager.service';

// Factory consumed by APP_INITIALIZER
export function weatherContentFactory(shell: ShellManager): () => void {
  return () => registerWeatherContent(shell);
  //     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //     Angular calls the returned () => void at app startup,
  //     before the first change-detection cycle.
}
```

The factory itself takes `ShellManager` as a parameter — Angular's DI
injects it because you declare it in `deps` (Step 5).

---

## Step 5 — Register the factory in `app.config.ts`

Open `src/app/app.config.ts` and add one provider object inside the
`providers` array:

```typescript
// src/app/app.config.ts
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { ShellManager } from './shell/shell-manager.service';
import { weatherContentFactory } from './weather/weather-content.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing NgRx providers stay untouched ...

    {
      provide: APP_INITIALIZER,       // Angular's multi-hook for startup work
      useFactory: weatherContentFactory,  // the factory from Step 4
      deps: [ShellManager],           // Angular injects ShellManager into the factory
      multi: true,                    // allows multiple APP_INITIALIZER entries
    },
  ],
};
```

`multi: true` is required — it tells Angular to append this initializer to
the list rather than replacing any existing one. Each domain registers its own
provider block independently.

---

## Step 6 — Verify the registration

Run the dev server and open the browser:

```bash
npm start
```

Check that:

1. Your tab label appears in the tab strip and clicking it renders your component.
2. Your sidebar icon appears in the activity bar.
3. Your toolbar button appears and triggers the `handler`.
4. Your bottom panel tab appears in the bottom panel (visible if `setBottomPanelVisible(true)` was called).

Open the browser console — if any ID is duplicated you will see a
`[ShellManager] Duplicate ... id '...' ignored.` warning.

---

## Reference: Mock implementations

The `src/app/shell/mock-ui/` folder contains working reference implementations
you can read as a guide. The pattern there mirrors exactly what this quickstart
describes:

| File | Purpose |
|---|---|
| `mock-registrations.ts` | Declares all mock contract objects (Step 2 equivalent) |
| `mock-content.initializer.ts` | `registerMockContent()` function (Step 3 equivalent) |
| `app.config.ts` `initializeShellContent` | Factory + provider wiring (Steps 4–5 equivalent) |

| Mock constant | Contract | Description |
|---|---|---|
| `MOCK_DASHBOARD_TAB` | `ICentralRegionTab` | Dashboard tab with fake KPI cards |
| `MOCK_REPORTS_TAB` | `ICentralRegionTab` | Reports tab with fake row data |
| `MOCK_NAV_SIDEBAR_ENTRY`, `MOCK_TOOLS_SIDEBAR_ENTRY` | `ISidebarEntry` | Navigation and tools sidebar panels |
| `MOCK_ALERT_INFO/WARNING/ERROR/SUCCESS` | `IToolbarAction` | Buttons that fire `window.alert` |
| `MOCK_RESULTS_PANEL`, `MOCK_LOGS_PANEL`, `MOCK_WARNINGS_PANEL` | `IBottomPanelEntry` | Bottom panel tabs with fake data |

---

## Reference: Contract interface summary

```typescript
// ICentralRegionTab
interface ICentralRegionTab {
  id: string;
  label: string;
  component: Type<unknown>;   // standalone Angular component
  icon?: string;
  closable?: boolean;         // defaults to true
}

// ISidebarEntry
interface ISidebarEntry {
  id: string;
  label: string;
  icon: string;               // required — sidebar is icon-first
  component: Type<unknown>;   // standalone Angular component
  tooltip?: string;
}

// IToolbarAction
interface IToolbarAction {
  id: string;
  label: string;
  icon: string;
  handler: () => void;        // no component needed; exceptions are caught
  tooltip?: string;
}

// IBottomPanelEntry
interface IBottomPanelEntry {
  id: string;
  label: string;
  icon?: string;
  component: Type<unknown>;   // standalone Angular component
}
```

---

## Domain ID conventions

| Domain | Tab id | Sidebar id | Action id | Panel id |
|---|---|---|---|---|
| Weather | `weather-main` | `weather-nav` | `weather-refresh` | `weather-output` |
| Stock Exchange | `stocks-main` | `stocks-nav` | `stocks-buy`, `stocks-sell` | `stocks-feed` |
| Reports | `reports-main` | `reports-nav` | `reports-export` | `reports-log` |

All domains use the same `ShellManager` API. The shell source code is never
modified to accommodate new domains.
