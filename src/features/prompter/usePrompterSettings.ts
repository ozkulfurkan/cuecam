import { useState } from 'react';

import { clamp } from '@/lib/clamp';

import {
  loadPrompterSettings,
  savePrompterSettings,
  type PrompterSettings,
} from '@/storage/prompterSettings';

import { SPEED_RANGE } from './scroll';

/** Speed and text size, remembered across launches (MMKV). */
export function usePrompterSettings() {
  const [settings, setSettings] = useState<PrompterSettings>(loadPrompterSettings);

  const update = (change: Partial<PrompterSettings>) => {
    setSettings((current) => ({ ...current, ...change }));
    savePrompterSettings(change);
  };

  return {
    ...settings,
    setSpeed: (speed: number) => update({ speed }),
    setFontSize: (fontSize: number) => update({ fontSize }),
    /**
     * Speed up/down by `steps` from the latest value (not the value of the last
     * render), so several key presses in one frame all count.
     */
    stepSpeed: (steps: number) =>
      setSettings((current) => {
        const speed = clamp(
          current.speed + steps * SPEED_RANGE.step,
          SPEED_RANGE.min,
          SPEED_RANGE.max,
        );
        // Idempotent, so a repeated updater call (Strict Mode) is harmless.
        savePrompterSettings({ speed });
        return { ...current, speed };
      }),
  };
}
