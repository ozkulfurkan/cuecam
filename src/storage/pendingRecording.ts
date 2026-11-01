import type { FinishedRecording } from '@/features/camera/recording';

import { storage } from './storage';

const KEY = 'recorder.pendingRecording.v1';

/**
 * A finished take that is not in the gallery yet. Written as soon as the file
 * is complete and cleared once the save attempt is over, so a take that ends
 * while the app is in the background survives the app being killed before it
 * comes back (the next visit to the recorder saves it).
 */
export function loadPendingRecording(): FinishedRecording | undefined {
  const raw = storage.getString(KEY);
  if (!raw) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as FinishedRecording).path === 'string' &&
      typeof (value as FinishedRecording).durationSeconds === 'number'
    ) {
      return value as FinishedRecording;
    }
  } catch {
    // Corrupt entry: fall through and drop it.
  }
  clearPendingRecording();
  return undefined;
}

export function savePendingRecording(recording: FinishedRecording): void {
  storage.set(KEY, JSON.stringify(recording));
}

export function clearPendingRecording(): void {
  storage.remove(KEY);
}
