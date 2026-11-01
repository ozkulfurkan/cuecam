import { Orientation, OrientationLock } from 'expo-screen-orientation';

/**
 * Where the front camera sits relative to the screen as the user sees it.
 * The prompter text goes next to it so the reader looks close to the lens.
 *
 * Both platforms agree on the landscape names (verified in
 * expo-screen-orientation's native code): LANDSCAPE_RIGHT is the phone turned
 * counter-clockwise — iOS `landscapeRight`, Android `ROTATION_90` — so its top
 * edge, and the camera, end up on the left. LANDSCAPE_LEFT is the mirror case.
 */
export type CameraSide = 'top' | 'left' | 'right';

export function cameraSideFor(orientation: Orientation): CameraSide {
  switch (orientation) {
    case Orientation.LANDSCAPE_RIGHT:
      return 'left';
    case Orientation.LANDSCAPE_LEFT:
      return 'right';
    default:
      // Portrait, or unknown (treated as portrait: the app's default).
      return 'top';
  }
}

export const isLandscape = (orientation: Orientation) =>
  orientation === Orientation.LANDSCAPE_LEFT || orientation === Orientation.LANDSCAPE_RIGHT;

/**
 * The lock that freezes the screen in its current orientation for the length
 * of a recording, so the video keeps one orientation from start to end.
 */
export function lockForRecording(orientation: Orientation): OrientationLock {
  switch (orientation) {
    case Orientation.LANDSCAPE_LEFT:
      return OrientationLock.LANDSCAPE_LEFT;
    case Orientation.LANDSCAPE_RIGHT:
      return OrientationLock.LANDSCAPE_RIGHT;
    default:
      return OrientationLock.PORTRAIT_UP;
  }
}

/**
 * Between recordings the recorder follows the phone. DEFAULT means all but
 * upside-down on iOS, and "let the system decide" on Android, which also
 * honours the user's auto-rotate setting.
 */
export const RECORDER_FREE_LOCK = OrientationLock.DEFAULT;

/** Every screen other than the recorder stays portrait. */
export const APP_LOCK = OrientationLock.PORTRAIT_UP;
