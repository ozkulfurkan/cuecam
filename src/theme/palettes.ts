// Palette A · "Cinema": near-black surfaces with a warm amber accent that stays
// distinct from the red record button. Both palettes must share the same keys.
export type Palette = {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  record: string;
  onRecord: string;
  /** Translucent backing for text drawn over the live camera (prompter, controls). */
  scrim: string;
  onScrim: string;
};

export const darkPalette: Palette = {
  background: '#0B0B0F',
  surface: '#16161C',
  surfaceRaised: '#202028',
  border: '#26262E',
  text: '#F5F5F7',
  textMuted: '#9A9AA5',
  accent: '#F5A524',
  onAccent: '#1A1204',
  record: '#FF3B30',
  onRecord: '#FFFFFF',
  scrim: 'rgba(0, 0, 0, 0.55)',
  onScrim: '#FFFFFF',
};

export const lightPalette: Palette = {
  background: '#FAFAF7',
  surface: '#FFFFFF',
  surfaceRaised: '#F0F0EC',
  border: '#E2E2DC',
  text: '#141417',
  textMuted: '#5F5F68',
  accent: '#A86200',
  onAccent: '#FFFFFF',
  record: '#E5281E',
  onRecord: '#FFFFFF',
  // The camera image underneath is the same in both themes, so the scrim is too.
  scrim: 'rgba(0, 0, 0, 0.55)',
  onScrim: '#FFFFFF',
};
