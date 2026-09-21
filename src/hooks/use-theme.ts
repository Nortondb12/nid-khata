import { useEffect, type ReactElement, type ReactNode } from 'react';

type Theme = 'light';

const THEME_ATTRIBUTE = 'data-theme';

export function useTheme() {
  const theme: Theme = 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(THEME_ATTRIBUTE, theme);
    root.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => {
    // Light-only build: dark mode has been removed, so toggling is a no-op.
  };

  return {
    theme,
    toggleTheme,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme();
  return children as ReactElement;
}
