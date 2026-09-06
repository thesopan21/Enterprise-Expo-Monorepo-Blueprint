import { theme, type Theme } from '@workspace/theme';
import { createContext, useContext, type PropsWithChildren } from 'react';

// Pass-through for now — @workspace/ui's components reference theme.colors
// directly rather than through context. This seam exists for future
// runtime (e.g. dark-mode) theme switching without every consumer needing
// to change how it reads tokens.
const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: PropsWithChildren) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): Theme {
  return useContext(ThemeContext);
}
