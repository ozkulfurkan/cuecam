import type { VideoQuality } from '@/storage/appSettings';

const MB = 1024 * 1024;

/**
 * Rough file size per minute of video, on the high side of what phones write
 * (H.264/HEVC at the platforms' default bitrates, plus AAC audio): about
 * 12 / 20 / 60 Mbit/s. Overestimating only makes the warning a bit early.
 */
export const BYTES_PER_MINUTE: Record<VideoQuality, number> = {
  '720p': 90 * MB,
  '1080p': 150 * MB,
  '4k': 450 * MB,
};

/** Left free for the OS: phones misbehave (and recorders fail) near a full disk. */
export const STORAGE_RESERVE_BYTES = 300 * MB;

/** Below this many minutes the user is warned before recording. */
export const LOW_STORAGE_MINUTES = 10;
/** Below this the warning is stronger: the take will be cut very short. */
export const CRITICAL_STORAGE_MINUTES = 2;

/** Never set the recorder's size limit below this; a tiny cap is useless. */
const MIN_FILE_SIZE_LIMIT = 10 * MB;

/**
 * Space one take may use. A finished take briefly exists twice — the
 * recorder's file and the gallery copy, until the first is deleted — so only
 * half of the free space (after the reserve) is available to the recording.
 */
export function recordableBytes(availableBytes: number): number {
  return Math.max(0, (availableBytes - STORAGE_RESERVE_BYTES) / 2);
}

/** Whole minutes of video that fit at this quality. */
export function recordableMinutes(availableBytes: number, quality: VideoQuality): number {
  return Math.floor(recordableBytes(availableBytes) / BYTES_PER_MINUTE[quality]);
}

export type StorageLevel = 'ok' | 'low' | 'critical';

export function storageLevel(
  availableBytes: number | undefined,
  quality: VideoQuality,
): StorageLevel {
  // Unknown free space (API failed): don't block recording on a guess.
  if (availableBytes === undefined) return 'ok';
  const minutes = recordableMinutes(availableBytes, quality);
  if (minutes < CRITICAL_STORAGE_MINUTES) return 'critical';
  if (minutes < LOW_STORAGE_MINUTES) return 'low';
  return 'ok';
}

/**
 * The recorder's maxFileSize: it stops and finalizes the file cleanly before
 * the disk fills up (a recorder that runs out of space can leave a file that
 * does not play). Undefined when free space is unknown.
 */
export function maxFileSizeFor(availableBytes: number | undefined): number | undefined {
  if (availableBytes === undefined) return undefined;
  return Math.max(MIN_FILE_SIZE_LIMIT, Math.floor(recordableBytes(availableBytes)));
}
