import { nativeTheme } from 'electron';
import { PreferenceStore } from '../preferences';
import { AppTheme, DEFAULT_THEME } from '../../contracts';

export class ThemeInitializer {
  private readonly preferenceStore: PreferenceStore;

  constructor(preferenceStore?: PreferenceStore) {
    this.preferenceStore = preferenceStore || PreferenceStore.getInstance();
  }

  async initialize(): Promise<AppTheme> {
    const theme = await this.preferenceStore.getTheme();
    this.applyTheme(theme);
    return theme;
  }

  private applyTheme(theme: AppTheme): void {
    nativeTheme.themeSource = theme === 'dark' ? 'dark' : 'light';
  }
}