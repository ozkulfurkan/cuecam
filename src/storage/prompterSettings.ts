import { snapToStep } from '@/lib/range';
import { FONT_SIZE_RANGE, SPEED_RANGE } from '@/features/prompter/scroll';

import { storage } from './storage';

export type PrompterSettings = {
  speed: number;
  fontSize: number;
};

const KEYS = {
  speed: 'prompter.speed',
  fontSize: 'prompter.fontSize',
} as const;

type Range = { min: number; max: number; step: number; default: number };

// Stored values may come from an older app version with different ranges, or
// be missing; always hand back something inside the current range.
function sanitize(value: number | undefined, range: Range): number {
  if (value === undefined || !Number.isFinite(value)) return range.default;
  return snapToStep(value, range.min, range.max, range.step);
}

export function loadPrompterSettings(): PrompterSettings {
  return {
    speed: sanitize(storage.getNumber(KEYS.speed), SPEED_RANGE),
    fontSize: sanitize(storage.getNumber(KEYS.fontSize), FONT_SIZE_RANGE),
  };
}

export function savePrompterSettings(settings: Partial<PrompterSettings>): void {
  if (settings.speed !== undefined) {
    storage.set(KEYS.speed, sanitize(settings.speed, SPEED_RANGE));
  }
  if (settings.fontSize !== undefined) {
    storage.set(KEYS.fontSize, sanitize(settings.fontSize, FONT_SIZE_RANGE));
  }
}
