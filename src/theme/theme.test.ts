import { contrastRatio, relativeLuminance } from './contrast';
import { darkPalette, lightPalette, type Palette } from './palettes';
import { paletteFor, resolveColorScheme } from './scheme';

describe('resolveColorScheme', () => {
  it('uses an explicit preference regardless of the system', () => {
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
    expect(resolveColorScheme('light', 'dark')).toBe('light');
  });

  it('follows the system for "system"', () => {
    expect(resolveColorScheme('system', 'light')).toBe('light');
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
  });

  it('falls back to dark when the system scheme is unknown', () => {
    expect(resolveColorScheme('system', null)).toBe('dark');
    expect(resolveColorScheme('system', undefined)).toBe('dark');
    expect(resolveColorScheme('system', 'unspecified')).toBe('dark');
  });
});

describe('paletteFor', () => {
  it('returns the matching palette', () => {
    expect(paletteFor('dark')).toBe(darkPalette);
    expect(paletteFor('light')).toBe(lightPalette);
  });
});

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('rejects non-hex input', () => {
    expect(() => relativeLuminance('red')).toThrow();
  });
});

describe.each([
  ['dark', darkPalette],
  ['light', lightPalette],
] as const)('%s palette', (_name, palette: Palette) => {
  // WCAG AA: 4.5:1 for body text, 3:1 for large text and UI components.
  it.each([
    ['text', 'background', 4.5],
    ['text', 'surface', 4.5],
    ['textMuted', 'background', 4.5],
    ['onAccent', 'accent', 4.5],
    ['accent', 'background', 3],
    ['onRecord', 'record', 3],
    ['record', 'background', 3],
  ] as const)('%s on %s reaches %s:1', (fg, bg, minimum) => {
    expect(contrastRatio(palette[fg], palette[bg])).toBeGreaterThanOrEqual(minimum);
  });
});

it('both palettes define the same tokens', () => {
  expect(Object.keys(lightPalette).sort()).toEqual(Object.keys(darkPalette).sort());
});
