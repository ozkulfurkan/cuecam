import type { CameraSide } from '@/features/camera/orientation';
import type { BoxFractions } from '@/features/prompter/boxEdit';

import { storage } from './storage';

// One custom box per camera side: portrait (camera on top) and the two
// landscape directions need different spots next to the lens.
const keyFor = (side: CameraSide) => `prompter.box.${side}`;

const isFraction = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;

/** The user's box for this camera side, or undefined to use the default layout. */
export function loadPrompterBox(side: CameraSide): BoxFractions | undefined {
  const raw = storage.getString(keyFor(side));
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<BoxFractions>;
    const { x, y, width, height } = value;
    if (isFraction(x) && isFraction(y) && isFraction(width) && isFraction(height)) {
      return { x, y, width, height };
    }
  } catch {
    // Corrupt value: fall through to the default layout.
  }
  return undefined;
}

export function savePrompterBox(side: CameraSide, box: BoxFractions): void {
  storage.set(keyFor(side), JSON.stringify(box));
}

export function clearPrompterBox(side: CameraSide): void {
  storage.remove(keyFor(side));
}
