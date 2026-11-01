// Single source for colors, typography and spacing. Screens read colors through
// useTheme() and sizes from the tokens below — never hard-coded values.
export { darkPalette, lightPalette, type Palette } from './palettes';
export {
  paletteFor,
  resolveColorScheme,
  type ColorScheme,
  type ColorSchemePreference,
} from './scheme';
export { ThemeProvider, useTheme, type Theme } from './ThemeProvider';
export {
  fontSize,
  iconSize,
  opacity,
  radius,
  recordButtonSize,
  sliderSize,
  spacing,
  textStyles,
  touchTarget,
} from './tokens';
