import * as Sentry from '@sentry/react-native';
import { getOrientationAsync, lockAsync, type OrientationLock } from 'expo-screen-orientation';
import { useEffect } from 'react';

import { APP_LOCK, lockForRecording, RECORDER_FREE_LOCK } from './orientation';

const lock = (value: OrientationLock) => lockAsync(value).catch(Sentry.captureException);

/**
 * Orientation rules for the recorder screen:
 * - while it is open and idle, it follows the phone (portrait or landscape);
 * - from the countdown until the recording ends, it stays in the orientation it
 *   had when the user pressed record, so the video never changes orientation;
 * - when it closes, the app goes back to portrait.
 */
export function useRecorderOrientationLock(busy: boolean) {
  useEffect(() => {
    lock(RECORDER_FREE_LOCK);
    return () => {
      lock(APP_LOCK);
    };
  }, []);

  useEffect(() => {
    if (!busy) {
      lock(RECORDER_FREE_LOCK);
      return;
    }
    let canceled = false;
    getOrientationAsync().then((current) => {
      if (!canceled) lock(lockForRecording(current));
    });
    return () => {
      canceled = true;
    };
  }, [busy]);
}
