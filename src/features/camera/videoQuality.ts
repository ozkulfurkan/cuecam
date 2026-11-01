import type { VideoQuality } from '@/storage/appSettings';

type Size = { width: number; height: number };

// Portrait-first sizes, as VisionCamera expects (it rotates for landscape).
// The camera picks the closest format it supports, so 4K falls back gracefully
// on phones that cannot record it.
const RESOLUTIONS: Record<VideoQuality, Size> = {
  '720p': { width: 720, height: 1280 },
  '1080p': { width: 1080, height: 1920 },
  '4k': { width: 2160, height: 3840 },
};

export function resolutionFor(quality: VideoQuality): Size {
  return RESOLUTIONS[quality];
}

/** Short label for the settings screen. */
export function qualityLabel(quality: VideoQuality): string {
  return quality === '4k' ? '4K' : quality;
}
