export type ThemeMode = 'light' | 'dark';

export type ThemeTokens = {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
};

export const THEME_TOKENS: Record<ThemeMode, ThemeTokens> = {
  light: {
    background: '#F6F7FB',
    surface: '#FFFFFF',
    text: '#14213D',
    mutedText: '#56617A',
    border: '#D9DFEA',
  },
  dark: {
    background: '#0B1220',
    surface: '#172033',
    text: '#E5ECF9',
    mutedText: '#A9B5CC',
    border: '#2A3954',
  },
};
