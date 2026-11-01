import type { CameraPosition, Constraint } from 'react-native-vision-camera';

export type LensPosition = Extract<CameraPosition, 'front' | 'back'>;

/** A prompter user faces the screen, so start on the selfie camera. */
export const DEFAULT_POSITION: LensPosition = 'front';

export const PREVIEW_FPS = 30;

/** Session constraints for the recorder preview (and, later, the video output). */
export const previewConstraints: Constraint[] = [{ fps: PREVIEW_FPS }];

export function otherPosition(position: LensPosition): LensPosition {
  return position === 'front' ? 'back' : 'front';
}

/**
 * The lens to actually use: the requested one if the device has it, otherwise
 * whichever exists (e.g. tablets or emulators with a single camera).
 */
export function resolvePosition(
  requested: LensPosition,
  available: readonly CameraPosition[],
): LensPosition | undefined {
  if (available.includes(requested)) return requested;
  const fallback = otherPosition(requested);
  return available.includes(fallback) ? fallback : undefined;
}

/** Switching only makes sense when both a front and a back lens exist. */
export function canSwitchPosition(available: readonly CameraPosition[]): boolean {
  return available.includes('front') && available.includes('back');
}
