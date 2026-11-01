import type { LanguagePreference } from '@/i18n/translate';

import { storage } from './storage';

export type VideoQuality = '720p' | '1080p' | '4k';

export const VIDEO_QUALITIES: readonly VideoQuality[] = ['720p', '1080p', '4k'];
export const DEFAULT_VIDEO_QUALITY: VideoQuality = '1080p';

const LANGUAGES: readonly LanguagePreference[] = ['system', 'en', 'tr'];

const KEYS = {
  language: 'settings.language',
  videoQuality: 'settings.videoQuality',
} as const;

// Unknown stored values (older/newer app versions) fall back to the default.
function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function loadLanguagePreference(): LanguagePreference {
  return oneOf(storage.getString(KEYS.language), LANGUAGES, 'system');
}

export function saveLanguagePreference(preference: LanguagePreference): void {
  storage.set(KEYS.language, preference);
}

export function loadVideoQuality(): VideoQuality {
  return oneOf(storage.getString(KEYS.videoQuality), VIDEO_QUALITIES, DEFAULT_VIDEO_QUALITY);
}

export function saveVideoQuality(quality: VideoQuality): void {
  storage.set(KEYS.videoQuality, quality);
}
