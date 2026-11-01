import { createContext, use, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { Palette } from './palettes';
import {
  paletteFor,
  resolveColorScheme,
  type ColorScheme,
  type ColorSchemePreference,
} from './scheme';

export type Theme = {
  scheme: ColorScheme;
  colors: Palette;
};

const ThemeContext = createContext<Theme>({ scheme: 'dark', colors: paletteFor('dark') });

type Props = {
  // Comes from settings in PRM-20. Note: app.config.ts sets userInterfaceStyle
  // 'dark', so 'system' only follows the OS once that is switched to 'automatic'.
  preference?: ColorSchemePreference;
  children: ReactNode;
};

export function ThemeProvider({ preference = 'dark', children }: Props) {
  const systemScheme = useColorScheme();
  const scheme = resolveColorScheme(preference, systemScheme);
  const theme = useMemo(() => ({ scheme, colors: paletteFor(scheme) }), [scheme]);

  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  return use(ThemeContext);
}
