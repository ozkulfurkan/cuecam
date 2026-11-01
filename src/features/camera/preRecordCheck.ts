import type { VideoQuality } from '@/storage/appSettings';
import type { Translate } from '@/i18n/translate';

import { recordableMinutes, storageLevel } from './storageSpace';
import { thermalWarning, type ThermalState } from './thermal';

export type PreRecordWarning =
  { kind: 'storage'; level: 'low' | 'critical'; minutes: number } | { kind: 'thermal' };

type Input = {
  /** Free bytes on the device, or undefined when the OS did not say. */
  availableBytes: number | undefined;
  quality: VideoQuality;
  thermal: ThermalState;
};

/**
 * What to warn about before a take starts. The user can still record anyway:
 * the recorder's size limit keeps the file intact if space runs out, and the
 * OS (not the app) decides when heat stops the camera.
 */
export function preRecordWarnings({ availableBytes, quality, thermal }: Input): PreRecordWarning[] {
  const warnings: PreRecordWarning[] = [];
  const level = storageLevel(availableBytes, quality);
  if (level !== 'ok' && availableBytes !== undefined) {
    warnings.push({ kind: 'storage', level, minutes: recordableMinutes(availableBytes, quality) });
  }
  // Only a phone that is already hot is worth interrupting the user for; a
  // warm one gets the on-screen notice instead.
  if (thermalWarning(thermal) === 'hot') warnings.push({ kind: 'thermal' });
  return warnings;
}

/** Alert text for the warnings, one paragraph each. */
export function preRecordMessage(
  warnings: PreRecordWarning[],
  quality: VideoQuality,
  t: Translate,
): string {
  return warnings
    .map((warning) => {
      if (warning.kind === 'thermal') return t('preRecord.hot');
      return t(
        warning.level === 'critical' ? 'preRecord.storageCritical' : 'preRecord.storageLow',
        {
          minutes: warning.minutes,
          quality,
        },
      );
    })
    .join('\n\n');
}
