// Minimal placeholder tokens. The full design system (palettes, typography scale,
// radii, light theme) arrives in PRM-5; until then screens read from here.
export const colors = {
  background: '#0B0B0F',
  surface: '#16161C',
  border: '#26262E',
  text: '#F5F5F7',
  textMuted: '#9A9AA5',
} as const;

export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const fontSize = {
  body: 16,
  title: 28,
} as const;

export const iconSize = {
  md: 24,
} as const;
