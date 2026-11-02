import type { TextStyle } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fontSize = {
  caption: 13,
  body: 16,
  subtitle: 20,
  title: 28,
  /** Full-screen numbers, e.g. the recording countdown. */
  display: 120,
} as const;

export const iconSize = {
  sm: 18,
  md: 24,
  lg: 32,
  /** Hero icons, e.g. on the intro pages. */
  xl: 56,
} as const;

// Minimum touch target (Apple HIG 44pt, Material 48dp — use the larger).
export const touchTarget = 48;

/** Page indicator dots (intro). */
export const dotSize = 8;

export const opacity = {
  pressed: 0.8,
  disabled: 0.4,
} as const;

/** Outline width for focus/edit frames (e.g. the movable prompter box). */
export const frameBorderWidth = 2;

export const sliderSize = {
  track: 4,
  thumb: 24,
  thumbBorder: 2,
} as const;

export const recordButtonSize = {
  outer: 76,
  ring: 4,
  dot: 60,
  stop: 30,
} as const;

export const textStyles = {
  title: { fontSize: fontSize.title, lineHeight: 34, fontWeight: '700' },
  subtitle: { fontSize: fontSize.subtitle, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: fontSize.body, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: fontSize.body, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: fontSize.caption, lineHeight: 18, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;
