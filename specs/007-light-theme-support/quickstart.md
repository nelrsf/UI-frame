# Light Theme Quickstart

## Overview

This document explains how to use and implement themes for the UI Frame shell.

## For Users

### Switching Themes

1. Open the application menu (menu nativo)
2. Navigate to **Temas** (or **Theme**)
3. Select **Oscuro** (Dark) or **Claro** (Light)

The interface updates immediately. Your preference is saved and restored on next launch.

## For Developers

### How Theme Switching Works

The theme system uses **two independent routes** that read from the same source of truth (`preferences.json`):

| Route | Process | When | Purpose |
|-------|---------|------|---------|
| **Main Process** | Electron main | Before window creation | Sets `nativeTheme.themeSource` for OS-level theming and builds native menu with correct theme |
| **Renderer Process** | Angular renderer | After window loads | Sets `body[data-theme]` attribute for CSS variable overrides |

**Why two routes?** They serve incompatible timing requirements:
- The main process must apply `nativeTheme` **before** the window shows (otherwise the OS window chrome uses the wrong theme)
- The renderer must apply CSS variables **after** the DOM loads (otherwise styles have no target)
- Both read the same file with the same structure — no inconsistency risk
- Alternative (main sends theme to renderer) would introduce race conditions and potential flash of wrong theme

### CSS Theme Architecture

#### File Structure

```
src/app/themes/
├── dark.css          # Dark theme: :root, body[data-theme="dark"] { ... }
├── light.css         # Light theme: body[data-theme="light"] { ... }
└── variables.css     # Orchestrator: @import './dark.css'; @import './light.css';
```

#### How Switching Works

1. `styles.css` imports `variables.css`
2. `variables.css` imports both `dark.css` and `light.css`
3. `dark.css` defines variables under `:root, body[data-theme="dark"]` (default)
4. `light.css` defines variables under `body[data-theme="light"]`
5. When `ThemeService` calls `document.body.setAttribute('data-theme', 'light')`, CSS cascade applies light theme variables

#### Using Theme Variables in Components

**Always use CSS variables, never hardcode colors:**

```css
/* ✅ CORRECT — adapts to theme automatically */
.my-component {
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}

/* ❌ WRONG — hardcoded dark color, won't adapt */
.my-component {
  background-color: #1e1e1e;
  color: #cccccc;
}
```

### Available Theme Variables

See `src/app/themes/dark.css` for the complete list (~50 variables). All variables must exist in **every** theme file with the same names.

| Category | Examples |
|----------|----------|
| Colors (surface) | `--color-bg-base`, `--color-bg-elevated`, `--color-bg-overlay`, `--color-bg-input`, `--color-bg-hover`, `--color-bg-active` |
| Colors (borders) | `--color-border-subtle`, `--color-border-default`, `--color-border-focus` |
| Colors (text) | `--color-text-primary`, `--color-text-secondary`, `--color-text-disabled`, `--color-text-inverse`, `--color-text-link` |
| Colors (accent) | `--color-accent`, `--color-accent-hover`, `--color-accent-active`, `--color-accent-primary` |
| Colors (semantic) | `--color-success`, `--color-warning`, `--color-error`, `--color-info` |
| Colors (shell) | `--color-activity-bar-bg`, `--color-sidebar-bg`, `--color-topbar-bg`, `--color-statusbar-bg`, `--color-statusbar-text` |
| Colors (tabs) | `--color-tab-active-bg`, `--color-tab-inactive-bg`, `--color-tab-border`, `--color-tabbar-bg`, `--color-tab-inactive-text`, `--color-tab-hover-bg`, `--color-tab-hover-text`, `--color-tab-active-text`, `--color-tab-dirty`, `--color-tab-close-hover` |
| Colors (panels) | `--color-panel-bg`, `--color-panel-text`, `--color-panel-header-bg`, `--color-panel-tab-text`, `--color-panel-tab-hover-bg`, `--color-panel-tab-hover-text`, `--color-panel-tab-active-text`, `--color-panel-action-text`, `--color-panel-action-hover-bg` |
| Colors (toolbar) | `--color-toolbar-bg`, `--color-toolbar-text`, `--color-toolbar-breadcrumb`, `--color-toolbar-separator`, `--color-toolbar-action-hover`, `--color-toolbar-action-active`, `--color-toolbar-action-active-text` |
| Colors (content) | `--color-content-bg`, `--color-content-text`, `--color-content-empty-text` |
| Typography | `--font-family-ui`, `--font-family-mono`, `--font-size-*`, `--font-weight-*`, `--line-height-*` |
| Spacing | `--spacing-1` through `--spacing-8` |
| Geometry | `--radius-sm`, `--radius-md`, `--radius-lg`, `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Transitions | `--transition-fast`, `--transition-base`, `--transition-slow` |
| Shell dimensions | `--shell-topbar-height`, `--shell-toolbar-height`, `--shell-tabbar-height`, `--shell-statusbar-height`, `--shell-activity-bar-width`, `--shell-sidebar-width`, etc. |
| Breakpoints | `--breakpoint-shell-xs`, `--breakpoint-shell-sm`, `--breakpoint-shell-md`, `--breakpoint-shell-lg` |

### Adding a New Theme

To add a new theme (e.g., "classic"):

#### Step 1: Create Theme File

Create `src/app/themes/classic.css`:

```css
/* ============================================================
   Classic Theme Tokens — Shell v1
   ============================================================ */

body[data-theme="classic"] {
  /* Surface colors */
  --color-bg-base:          #f5f5dc;
  --color-bg-elevated:      #ebe8d8;
  --color-bg-overlay:       #f5f5dc;
  --color-bg-input:         #ebe8d8;
  --color-bg-hover:         #e0ddd0;
  --color-bg-active:        #0078d4;

  /* Borders */
  --color-border-subtle:    #d4d0c0;
  --color-border-default:   #c0bca8;
  --color-border-focus:     #0078d4;

  /* Text */
  --color-text-primary:     #1e1e1e;
  --color-text-secondary:   #6e6e6e;
  --color-text-disabled:    #a0a0a0;
  --color-text-inverse:     #ffffff;
  --color-text-link:        #0066b8;

  /* Accent */
  --color-accent:           #8b7355;
  --color-accent-hover:     #7a6548;
  --color-accent-active:    #6b5840;
  --color-accent-primary:   #8b7355;

  /* Semantic */
  --color-success:          #2e7d32;
  --color-warning:          #f57f17;
  --color-error:            #c62828;
  --color-info:             #1565c0;

  /* Shell regions */
  --color-activity-bar-bg:  #ebe8d8;
  --color-sidebar-bg:       #ebe8d8;
  --color-topbar-bg:        #f5f5dc;
  --color-statusbar-bg:     #8b7355;
  --color-statusbar-text:   #ffffff;

  /* Tabs */
  --color-tab-active-bg:    #f5f5dc;
  --color-tab-inactive-bg:  #e8e5d5;
  --color-tab-border:       #8b7355;
  --color-tabbar-bg:        #ebe8d8;
  --color-tab-inactive-text: #6e6e6e;
  --color-tab-hover-bg:     #e0ddd0;
  --color-tab-hover-text:   #1e1e1e;
  --color-tab-active-text:  #1e1e1e;
  --color-tab-dirty:        #f57f17;
  --color-tab-close-hover:  rgba(0, 0, 0, 0.1);

  /* Panels */
  --color-panel-bg:         #f5f5dc;
  --color-panel-text:       #1e1e1e;
  --color-panel-header-bg:  #ebe8d8;
  --color-panel-tab-text:   #6e6e6e;
  --color-panel-tab-hover-bg: #e0ddd0;
  --color-panel-tab-hover-text: #1e1e1e;
  --color-panel-tab-active-text: #1e1e1e;
  --color-panel-action-text: #1e1e1e;
  --color-panel-action-hover-bg: #e0ddd0;

  /* Toolbar */
  --color-toolbar-bg:       #f5f5dc;
  --color-toolbar-text:     #1e1e1e;
  --color-toolbar-breadcrumb: #6e6e6e;
  --color-toolbar-separator: #d4d0c0;
  --color-toolbar-action-hover: rgba(0, 0, 0, 0.05);
  --color-toolbar-action-active: rgba(0, 0, 0, 0.1);
  --color-toolbar-action-active-text: #1e1e1e;

  /* Content */
  --color-content-bg:       #f5f5dc;
  --color-content-text:     #1e1e1e;
  --color-content-empty-text: #6e6e6e;

  /* Typography, spacing, geometry, transitions, dimensions, breakpoints */
  /* Copy these from dark.css — they don't change per theme */
  --font-family-ui:         "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-family-mono:       "Cascadia Code", "Fira Code", "Consolas", monospace;
  --font-size-xs:           11px;
  /* ... rest of non-color variables ... */
}
```

**Important**: Every variable defined in `dark.css` must also exist in your new theme file with the same name.

#### Step 2: Register the Theme

Add import to `src/app/themes/variables.css`:

```css
@import './dark.css';
@import './light.css';
@import './classic.css';  /* ← add this line */
```

#### Step 3: Add Menu Option

Add entry in `src/electron/menu/menu.builder.ts` (inside `buildThemesMenu`):

```typescript
{
  id: 'themes.classic',
  label: 'Clásico',
  type: 'radio',
  checked: context.activeTheme === 'classic',
  enabled: true,
  click: () => {
    this.applyTheme('classic', context);
  },
},
```

#### Step 4: Update Type Contract

Update `src/contracts/theme.ts`:

```typescript
export type AppTheme = 'dark' | 'light' | 'classic';
```

#### Step 5: Done

The `ThemeAdapter` already supports any theme value. No other changes needed.

### Extending Existing Themes

To add a new color token (e.g., `--color-custom-highlight`):

1. Add to **all** theme files (`dark.css`, `light.css`, and any custom themes)
2. Use the same variable name in every file
3. Components using `var(--color-custom-highlight)` will adapt automatically

### Testing Theme Changes

```bash
# Run existing tests
npm test

# Verify theme switching in dev mode
npm run electron:dev
# Then use menu to switch themes and inspect in DevTools
# Check: body[data-theme] attribute changes correctly
# Check: CSS variables resolve to correct values
```

## File Reference

| File | Purpose |
|------|---------|
| `src/app/themes/dark.css` | Dark theme CSS variables (default) |
| `src/app/themes/light.css` | Light theme CSS variables |
| `src/app/themes/variables.css` | Theme import orchestrator |
| `src/app/core/application/theme.service.ts` | Theme coordination service |
| `src/app/core/application/ports/theme.port.ts` | ThemeAdapter interface and implementation |
| `src/app/core/models/theme.model.ts` | AppTheme type definition |
| `src/electron/menu/menu.builder.ts` | Menu theme options handler |
| `src/electron/preferences/preference-store.ts` | Theme persistence |
| `src/contracts/theme.ts` | Theme preference contract |

## Common Issues

| Issue | Solution |
|-------|----------|
| Theme not switching | Check `body[data-theme]` attribute in DevTools; verify `ThemeService.initialize()` is called |
| Colors not applying | Verify component uses `var(--color-*)` not hardcoded colors; check `variables.css` imports theme file |
| Some components still dark | Check if component has hardcoded colors; replace with CSS variables |
| Preference not saved | Verify `PreferencesAdapter` IPC bridge is working; check `preferences.json` in userData folder |
| Flash of wrong theme on startup | This is expected — main process applies nativeTheme before window shows, renderer applies CSS after load |
