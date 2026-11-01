import { darkPalette, lightPalette, type Palette } from './palettes';

export type ColorScheme = 'dark' | 'light';
export type ColorSchemePreference = ColorScheme | 'system';

/**
 * Picks the scheme to render. Dark is the product default, so an unknown
 * system scheme falls back to dark rather than light.
 */
export function resolveColorScheme(
  preference: ColorSchemePreference,
  systemScheme: string | null | undefined,
): ColorScheme {
  if (preference !== 'system') return preference;
  return systemScheme === 'light' ? 'light' : 'dark';
}

export function paletteFor(scheme: ColorScheme): Palette {
  return scheme === 'light' ? lightPalette : darkPalette;
}
