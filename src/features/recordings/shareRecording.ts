import * as Sentry from '@sentry/react-native';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

/** Opens the system share sheet for a recording. Returns false if sharing failed. */
export async function shareRecording(uri: string): Promise<boolean> {
  try {
    if (!(await isAvailableAsync())) return false;
    await shareAsync(uri, { mimeType: 'video/mp4', UTI: 'public.movie' });
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
}
