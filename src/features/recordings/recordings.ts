export type Recording = {
  /** Media-library asset id. */
  id: string;
  uri: string;
  durationSeconds: number;
  /** Epoch milliseconds, or 0 when the library does not know. */
  createdAt: number;
};

/** Newest first; recordings without a date go last. */
export function sortRecordings(recordings: readonly Recording[]): Recording[] {
  return [...recordings].sort((a, b) => b.createdAt - a.createdAt);
}

/** "2 Nov 2026, 14:05" / "2 Kas 2026 14:05" in the app language. */
export function formatRecordingDate(createdAt: number, language: string): string {
  if (!createdAt) return '';
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

// expo-media-library's docs say getCreationTime/getDuration return seconds, but
// both native implementations return milliseconds (iOS: millisecondsSince1970 and
// duration * 1000; Android: MediaStore DATE_TAKEN and DURATION, both in ms).

/** Creation time from the media library (ms), or 0 when unknown. */
export function creationTimeMs(value: number | null | undefined): number {
  return value && value > 0 ? value : 0;
}

/** Duration from the media library (ms) in seconds, or 0 when unknown. */
export function durationSeconds(valueMs: number | null | undefined): number {
  return valueMs && valueMs > 0 ? valueMs / 1000 : 0;
}
