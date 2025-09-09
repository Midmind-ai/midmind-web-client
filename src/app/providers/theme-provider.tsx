/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { LocalStorageKeys } from '@constants/local-storage';
import { getFromStorage, setToStorage } from '@utils/local-storage';

type Theme = 'dark' | 'light' | 'system';

type Props = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type State = {
  theme: Theme;
  resolveTheme: (theme: Theme) => Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: State = {
  theme: 'system',
  resolveTheme: () => 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<State>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = LocalStorageKeys.Theme,
  ...props
}: Props) {
  const [theme, setTheme] = useState<Theme>(
    () => getFromStorage<Theme>(storageKey) || defaultTheme
  );

  const resolveTheme = useCallback((theme: Theme) => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      return systemTheme;
    }

    return theme;
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    const resolvedTheme = resolveTheme(theme);

    root.classList.add(resolvedTheme);

    root.classList.add(theme);
  }, [theme, resolveTheme]);

  const value = {
    theme,
    resolveTheme,
    setTheme: (theme: Theme) => {
      setToStorage(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={value}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
