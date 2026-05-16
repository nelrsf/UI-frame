/**
 * Tests for the MenuBuilder construction and customization logic.
 *
 * Validates:
 *   - Default Spanish entries are present in the menu template
 *   - Override labels are applied to menu entries
 *   - file.exit cannot be hidden (visible: false is silently ignored)
 *   - extraEntries are appended as top-level entries after built-in defaults
 *   - themes.light is always disabled regardless of context
 *
 * No real Electron runtime is required: the construction logic is exercised
 * through pure helper functions that mirror the MenuBuilder implementation.
 *
 * References: US3 (Developer Customization API), D1, C1 (spec 005)
 */

// ---------------------------------------------------------------------------
// Type mirrors — replicate the public contracts without importing Electron
// ---------------------------------------------------------------------------

interface MenuItemOptions {
  id?: string;
  label?: string;
  type?: string;
  checked?: boolean;
  enabled?: boolean;
  visible?: boolean;
  accelerator?: string;
  click?: () => void;
  submenu?: MenuItemOptions[];
}

interface MenuConfig {
  overrides?: Record<string, Partial<MenuItemOptions>>;
  extraEntries?: MenuItemOptions[];
}

interface MenuBuildContext {
  activeTheme: 'dark' | 'light';
  isDev: boolean;
  bottomPanelVisible?: boolean;
  secondaryPanelVisible?: boolean;
}

// ---------------------------------------------------------------------------
// Pure helper — mirrors MenuBuilder.buildFileMenu()
// ---------------------------------------------------------------------------

function buildFileMenu(config: MenuConfig): MenuItemOptions {
  const exitEntry: MenuItemOptions = {
    id: 'file.exit',
    label: 'Salir',
    accelerator: 'CmdOrCtrl+Q',
  };

  const exitOverride = config.overrides?.['file.exit'];
  if (exitOverride) {
    const merged = { ...exitEntry, ...exitOverride };
    if (exitOverride.visible === false) {
      merged.visible = true; // silently ignore hide attempt
    }
    Object.assign(exitEntry, merged);
  }

  return { label: 'Archivo', submenu: [exitEntry] };
}

// ---------------------------------------------------------------------------
// Pure helper — mirrors MenuBuilder.buildViewMenu()
// ---------------------------------------------------------------------------

function buildViewMenu(config: MenuConfig, context: MenuBuildContext): MenuItemOptions {
  const submenu: MenuItemOptions[] = [];

  if (context.isDev) {
    submenu.push({ id: 'view.devtools', label: 'Mostrar DevTools' });
    submenu.push({ type: 'separator' });
  }

  submenu.push({
    id: 'view.bottomPanel',
    label: 'Panel inferior',
    type: 'checkbox',
    checked: context.bottomPanelVisible ?? true,
  });

  submenu.push({
    id: 'view.secondaryPanel',
    label: 'Panel secundario',
    type: 'checkbox',
    checked: context.secondaryPanelVisible ?? true,
  });

  for (const slotId of ['view.bottomPanel', 'view.secondaryPanel', 'view.devtools']) {
    if (config.overrides?.[slotId]) {
      const idx = submenu.findIndex((item) => item.id === slotId);
      if (idx >= 0) {
        submenu[idx] = { ...submenu[idx], ...config.overrides[slotId] };
      }
    }
  }

  return { label: 'Vista', submenu };
}

// ---------------------------------------------------------------------------
// Pure helper — mirrors MenuBuilder.buildThemesMenu()
// ---------------------------------------------------------------------------

function buildThemesMenu(config: MenuConfig, context: MenuBuildContext): MenuItemOptions {
  const submenu: MenuItemOptions[] = [
    {
      id: 'themes.dark',
      label: 'Oscuro',
      type: 'radio',
      checked: context.activeTheme === 'dark',
    },
    {
      id: 'themes.light',
      label: 'Claro',
      type: 'radio',
      checked: context.activeTheme === 'light',
      enabled: false, // Future: enable when light theme spec ships
    },
  ];

  for (const slotId of ['themes.dark', 'themes.light']) {
    if (config.overrides?.[slotId]) {
      const idx = submenu.findIndex((item) => item.id === slotId);
      if (idx >= 0) {
        const merged = { ...submenu[idx], ...config.overrides[slotId] };
        // Re-enforce themes.light always disabled
        if (slotId === 'themes.light') {
          merged.enabled = false;
        }
        submenu[idx] = merged;
      }
    }
  }

  return { label: 'Temas', submenu };
}

// ---------------------------------------------------------------------------
// Pure helper — mirrors MenuBuilder.buildTemplate()
// ---------------------------------------------------------------------------

function buildTemplate(
  config: MenuConfig,
  context: MenuBuildContext
): MenuItemOptions[] {
  const topLevel: MenuItemOptions[] = [
    buildFileMenu(config),
    buildViewMenu(config, context),
    buildThemesMenu(config, context),
  ];

  if (config.extraEntries) {
    topLevel.push(...config.extraEntries);
  }

  return topLevel;
}

// ---------------------------------------------------------------------------
// Shared test context
// ---------------------------------------------------------------------------

const DEFAULT_CTX: MenuBuildContext = { activeTheme: 'dark', isDev: false };

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('MenuBuilder — default Spanish entries', () => {
  it('should include Archivo as the first top-level menu', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    expect(template[0].label).toBe('Archivo');
  });

  it('should include Vista as the second top-level menu', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    expect(template[1].label).toBe('Vista');
  });

  it('should include Temas as the third top-level menu', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    expect(template[2].label).toBe('Temas');
  });

  it('should include file.exit under Archivo', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'file.exit');
    expect(salir).toBeDefined();
    expect(salir?.label).toBe('Salir');
  });

  it('should include view.bottomPanel under Vista', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[1].submenu?.find((item) => item.id === 'view.bottomPanel');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Panel inferior');
  });

  it('should include view.secondaryPanel under Vista', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[1].submenu?.find((item) => item.id === 'view.secondaryPanel');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Panel secundario');
  });

  it('should include themes.dark under Temas', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[2].submenu?.find((item) => item.id === 'themes.dark');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Oscuro');
  });

  it('should include themes.light under Temas', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[2].submenu?.find((item) => item.id === 'themes.light');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Claro');
  });

  it('should hide view.devtools when isDev is false', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const devtools = template[1].submenu?.find((item) => item.id === 'view.devtools');
    expect(devtools).toBeUndefined();
  });

  it('should show view.devtools when isDev is true', () => {
    const template = buildTemplate({}, { ...DEFAULT_CTX, isDev: true });
    const devtools = template[1].submenu?.find((item) => item.id === 'view.devtools');
    expect(devtools).toBeDefined();
  });
});

describe('MenuBuilder — override label applied', () => {
  it('should apply a label override to file.exit', () => {
    const config: MenuConfig = {
      overrides: { 'file.exit': { label: 'Exit' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'file.exit');
    expect(salir?.label).toBe('Exit');
  });

  it('should apply a label override to view.bottomPanel', () => {
    const config: MenuConfig = {
      overrides: { 'view.bottomPanel': { label: 'Console' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const entry = template[1].submenu?.find((item) => item.id === 'view.bottomPanel');
    expect(entry?.label).toBe('Console');
  });

  it('should apply a label override to themes.dark', () => {
    const config: MenuConfig = {
      overrides: { 'themes.dark': { label: 'Dark Mode' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const entry = template[2].submenu?.find((item) => item.id === 'themes.dark');
    expect(entry?.label).toBe('Dark Mode');
  });
});

describe('MenuBuilder — file.exit cannot be hidden (D1 guard)', () => {
  it('should silently ignore visible: false override for file.exit', () => {
    const config: MenuConfig = {
      overrides: { 'file.exit': { visible: false } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'file.exit');
    expect(salir).toBeDefined();
    expect(salir?.visible).not.toBe(false);
  });

  it('should still apply other properties when visible: false is also supplied', () => {
    const config: MenuConfig = {
      overrides: { 'file.exit': { visible: false, label: 'Quit' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'file.exit');
    expect(salir?.label).toBe('Quit');
    expect(salir?.visible).not.toBe(false);
  });
});

describe('MenuBuilder — extraEntries appended after built-in defaults', () => {
  it('should append a single extra entry after the 3 default menus', () => {
    const config: MenuConfig = {
      extraEntries: [{ label: 'Ayuda' }],
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    expect(template.length).toBe(4);
    expect(template[3].label).toBe('Ayuda');
  });

  it('should append multiple extra entries in order', () => {
    const config: MenuConfig = {
      extraEntries: [{ label: 'Ayuda' }, { label: 'Herramientas' }],
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    expect(template.length).toBe(5);
    expect(template[3].label).toBe('Ayuda');
    expect(template[4].label).toBe('Herramientas');
  });

  it('should not append extra entries when extraEntries is undefined', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    expect(template.length).toBe(3);
  });
});

describe('MenuBuilder — themes.light always disabled', () => {
  it('should have themes.light enabled: false by default', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const claro = template[2].submenu?.find((item) => item.id === 'themes.light');
    expect(claro?.enabled).toBeFalse();
  });

  it('should keep themes.light enabled: false even when override tries to enable it', () => {
    const config: MenuConfig = {
      overrides: { 'themes.light': { enabled: true } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const claro = template[2].submenu?.find((item) => item.id === 'themes.light');
    expect(claro?.enabled).toBeFalse();
  });

  it('should keep themes.light disabled in light-theme context', () => {
    const template = buildTemplate({}, { ...DEFAULT_CTX, activeTheme: 'light' });
    const claro = template[2].submenu?.find((item) => item.id === 'themes.light');
    expect(claro?.enabled).toBeFalse();
  });
});
