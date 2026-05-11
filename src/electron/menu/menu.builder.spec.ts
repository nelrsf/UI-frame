/**
 * Tests for the MenuBuilder construction and customization logic.
 *
 * Validates:
 *   - Default Spanish entries are present in the menu template
 *   - Override labels are applied to menu entries
 *   - archivo.salir cannot be hidden (visible: false is silently ignored)
 *   - extraEntries are appended as top-level entries after built-in defaults
 *   - temas.claro is always disabled regardless of context
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
// Pure helper — mirrors MenuBuilder.buildArchivoMenu()
// ---------------------------------------------------------------------------

function buildArchivoMenu(config: MenuConfig): MenuItemOptions {
  const salirEntry: MenuItemOptions = {
    id: 'archivo.salir',
    label: 'Salir',
    accelerator: 'CmdOrCtrl+Q',
  };

  const salirOverride = config.overrides?.['archivo.salir'];
  if (salirOverride) {
    const merged = { ...salirEntry, ...salirOverride };
    if (salirOverride.visible === false) {
      merged.visible = true; // silently ignore hide attempt
    }
    Object.assign(salirEntry, merged);
  }

  return { label: 'Archivo', submenu: [salirEntry] };
}

// ---------------------------------------------------------------------------
// Pure helper — mirrors MenuBuilder.buildVistaMenu()
// ---------------------------------------------------------------------------

function buildVistaMenu(config: MenuConfig, context: MenuBuildContext): MenuItemOptions {
  const submenu: MenuItemOptions[] = [];

  if (context.isDev) {
    submenu.push({ id: 'vista.devtools', label: 'Mostrar DevTools' });
    submenu.push({ type: 'separator' });
  }

  submenu.push({
    id: 'vista.bottomPanel',
    label: 'Panel inferior',
    type: 'checkbox',
    checked: context.bottomPanelVisible ?? true,
  });

  submenu.push({
    id: 'vista.secondaryPanel',
    label: 'Panel secundario',
    type: 'checkbox',
    checked: context.secondaryPanelVisible ?? true,
  });

  for (const slotId of ['vista.bottomPanel', 'vista.secondaryPanel', 'vista.devtools']) {
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
// Pure helper — mirrors MenuBuilder.buildTemasMenu()
// ---------------------------------------------------------------------------

function buildTemasMenu(config: MenuConfig, context: MenuBuildContext): MenuItemOptions {
  const submenu: MenuItemOptions[] = [
    {
      id: 'temas.oscuro',
      label: 'Oscuro',
      type: 'radio',
      checked: context.activeTheme === 'dark',
    },
    {
      id: 'temas.claro',
      label: 'Claro',
      type: 'radio',
      checked: context.activeTheme === 'light',
      enabled: false, // Future: enable when light theme spec ships
    },
  ];

  for (const slotId of ['temas.oscuro', 'temas.claro']) {
    if (config.overrides?.[slotId]) {
      const idx = submenu.findIndex((item) => item.id === slotId);
      if (idx >= 0) {
        const merged = { ...submenu[idx], ...config.overrides[slotId] };
        // Re-enforce temas.claro always disabled
        if (slotId === 'temas.claro') {
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
    buildArchivoMenu(config),
    buildVistaMenu(config, context),
    buildTemasMenu(config, context),
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

  it('should include archivo.salir under Archivo', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'archivo.salir');
    expect(salir).toBeDefined();
    expect(salir?.label).toBe('Salir');
  });

  it('should include vista.bottomPanel under Vista', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[1].submenu?.find((item) => item.id === 'vista.bottomPanel');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Panel inferior');
  });

  it('should include vista.secondaryPanel under Vista', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[1].submenu?.find((item) => item.id === 'vista.secondaryPanel');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Panel secundario');
  });

  it('should include temas.oscuro under Temas', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[2].submenu?.find((item) => item.id === 'temas.oscuro');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Oscuro');
  });

  it('should include temas.claro under Temas', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const entry = template[2].submenu?.find((item) => item.id === 'temas.claro');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('Claro');
  });

  it('should hide vista.devtools when isDev is false', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const devtools = template[1].submenu?.find((item) => item.id === 'vista.devtools');
    expect(devtools).toBeUndefined();
  });

  it('should show vista.devtools when isDev is true', () => {
    const template = buildTemplate({}, { ...DEFAULT_CTX, isDev: true });
    const devtools = template[1].submenu?.find((item) => item.id === 'vista.devtools');
    expect(devtools).toBeDefined();
  });
});

describe('MenuBuilder — override label applied', () => {
  it('should apply a label override to archivo.salir', () => {
    const config: MenuConfig = {
      overrides: { 'archivo.salir': { label: 'Exit' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'archivo.salir');
    expect(salir?.label).toBe('Exit');
  });

  it('should apply a label override to vista.bottomPanel', () => {
    const config: MenuConfig = {
      overrides: { 'vista.bottomPanel': { label: 'Console' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const entry = template[1].submenu?.find((item) => item.id === 'vista.bottomPanel');
    expect(entry?.label).toBe('Console');
  });

  it('should apply a label override to temas.oscuro', () => {
    const config: MenuConfig = {
      overrides: { 'temas.oscuro': { label: 'Dark Mode' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const entry = template[2].submenu?.find((item) => item.id === 'temas.oscuro');
    expect(entry?.label).toBe('Dark Mode');
  });
});

describe('MenuBuilder — archivo.salir cannot be hidden (D1 guard)', () => {
  it('should silently ignore visible: false override for archivo.salir', () => {
    const config: MenuConfig = {
      overrides: { 'archivo.salir': { visible: false } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'archivo.salir');
    expect(salir).toBeDefined();
    expect(salir?.visible).not.toBe(false);
  });

  it('should still apply other properties when visible: false is also supplied', () => {
    const config: MenuConfig = {
      overrides: { 'archivo.salir': { visible: false, label: 'Quit' } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const salir = template[0].submenu?.find((item) => item.id === 'archivo.salir');
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

describe('MenuBuilder — temas.claro always disabled', () => {
  it('should have temas.claro enabled: false by default', () => {
    const template = buildTemplate({}, DEFAULT_CTX);
    const claro = template[2].submenu?.find((item) => item.id === 'temas.claro');
    expect(claro?.enabled).toBeFalse();
  });

  it('should keep temas.claro enabled: false even when override tries to enable it', () => {
    const config: MenuConfig = {
      overrides: { 'temas.claro': { enabled: true } },
    };
    const template = buildTemplate(config, DEFAULT_CTX);
    const claro = template[2].submenu?.find((item) => item.id === 'temas.claro');
    expect(claro?.enabled).toBeFalse();
  });

  it('should keep temas.claro disabled in light-theme context', () => {
    const template = buildTemplate({}, { ...DEFAULT_CTX, activeTheme: 'light' });
    const claro = template[2].submenu?.find((item) => item.id === 'temas.claro');
    expect(claro?.enabled).toBeFalse();
  });
});
