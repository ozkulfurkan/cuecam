import type { AppStateStatus } from 'react-native';

/**
 * Why a recording was cut short by something other than the stop button.
 *
 * - `app-background`: the user left the app (home gesture, app switcher, a
 *   full-screen incoming call on Android).
 * - `audio-in-use`: another client took the microphone — on iOS this is how an
 *   incoming phone/FaceTime call, Siri or an alarm shows up (the capture
 *   session's audio is interrupted).
 * - `camera-unavailable`: the OS took the camera away (another app, split
 *   screen, backgrounding reported by the camera itself).
 * - `system-pressure`: the camera was stopped because the phone is too hot.
 * - `storage-full`: the recorder hit its size limit (set from free space,
 *   see storageSpace.ts) and stopped before the disk filled up.
 * - `recording-error`: the recorder itself reported an error mid-take.
 */
export type InterruptionCause =
  | 'app-background'
  | 'audio-in-use'
  | 'camera-unavailable'
  | 'system-pressure'
  | 'storage-full'
  | 'recording-error';

/**
 * Only a real backgrounding interrupts a take. iOS also reports `inactive` for
 * Control Center, Notification Center and the incoming-call banner; stopping
 * there would end takes for a harmless swipe, and a call that actually takes
 * the microphone arrives separately as a camera interruption ('audio-in-use').
 * Android goes straight from `active` to `background`.
 */
export function causeFromAppState(
  next: AppStateStatus | string | null | undefined,
): InterruptionCause | undefined {
  return next === 'background' ? 'app-background' : undefined;
}

/**
 * Maps VisionCamera's InterruptionReason. iOS reports specific reasons from
 * AVCaptureSession; Android always reports 'unknown'.
 */
export function causeFromCameraInterruption(reason: string): InterruptionCause {
  switch (reason) {
    case 'audio-device-in-use-by-another-client':
      return 'audio-in-use';
    case 'video-device-not-available-due-to-system-pressure':
      return 'system-pressure';
    case 'video-device-not-available-in-background':
      return 'app-background';
    default:
      return 'camera-unavailable';
  }
}

/**
 * Whether a recorder error should still try to keep the file. On iOS an
 * interrupted AVCaptureMovieFileOutput reports an error although the movie up
 * to that point is written and playable, so any error after the recording has
 * started is worth rescuing; the gallery rejects the file if it is unusable.
 */
export function shouldRescueAfterError(hadStarted: boolean, fileExists: boolean): boolean {
  return hadStarted && fileExists;
}
