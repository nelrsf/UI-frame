import { AppTheme } from './theme';

export interface ThemeMetadata {
  backgroundColor: string;
  nativeTheme: 'dark' | 'light';
}

export const THEME_METADATA: Record<AppTheme, ThemeMetadata> = {
  dark: {
    backgroundColor: '#1e1e1e',
    nativeTheme: 'dark',
  },
  light: {
    backgroundColor: '#ffffff',
    nativeTheme: 'light',
  },
};
