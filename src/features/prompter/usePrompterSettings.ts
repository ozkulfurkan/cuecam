import { useState } from 'react';

import {
  loadPrompterSettings,
  savePrompterSettings,
  type PrompterSettings,
} from '@/storage/prompterSettings';

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
  };
}
