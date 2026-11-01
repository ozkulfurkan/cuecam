import * as Sentry from '@sentry/react-native';
import { Paths } from 'expo-file-system';

/** Free bytes on the volume the recorder writes to, or undefined if unknown. */
export function readAvailableBytes(): number | undefined {
  try {
    const bytes = Paths.availableDiskSpace;
    return Number.isFinite(bytes) && bytes >= 0 ? bytes : undefined;
  } catch (error) {
    Sentry.captureException(error);
    return undefined;
  }
}
