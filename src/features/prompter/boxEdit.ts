import type { PrompterBox } from './layout';

/** The area the text box must stay inside (safe area minus a margin). */
export type Bounds = { left: number; top: number; right: number; bottom: number };

/** Smallest box that still shows a couple of readable lines. */
export const MIN_BOX_SIZE = { width: 160, height: 96 } as const;

/** A box stored as fractions of the screen, so it fits other screen sizes. */
export type BoxFractions = { x: number; y: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/** Fits a box inside the bounds: not smaller than the minimum, not off-screen. */
export function clampBox(
  box: PrompterBox,
  bounds: Bounds,
  min: { width: number; height: number } = MIN_BOX_SIZE,
): PrompterBox {
  const maxWidth = bounds.right - bounds.left;
  const maxHeight = bounds.bottom - bounds.top;
  const width = clamp(box.width, Math.min(min.width, maxWidth), maxWidth);
  const height = clamp(box.height, Math.min(min.height, maxHeight), maxHeight);
  return {
    width,
    height,
    left: clamp(box.left, bounds.left, bounds.right - width),
    top: clamp(box.top, bounds.top, bounds.bottom - height),
  };
}

/** Box dragged by (dx, dy) from where the drag started. */
export function moveBox(start: PrompterBox, dx: number, dy: number, bounds: Bounds): PrompterBox {
  return clampBox({ ...start, left: start.left + dx, top: start.top + dy }, bounds);
}

/**
 * Box resized from its bottom-right corner by (dw, dh). The top-left corner
 * stays put, so the size is limited by the space to the right and below.
 */
export function resizeBox(
  start: PrompterBox,
  dw: number,
  dh: number,
  bounds: Bounds,
  min: { width: number; height: number } = MIN_BOX_SIZE,
): PrompterBox {
  const width = clamp(start.width + dw, min.width, bounds.right - start.left);
  const height = clamp(start.height + dh, min.height, bounds.bottom - start.top);
  return clampBox({ ...start, width, height }, bounds, min);
}

export function toFractions(box: PrompterBox, screen: { width: number; height: number }) {
  return {
    x: box.left / screen.width,
    y: box.top / screen.height,
    width: box.width / screen.width,
    height: box.height / screen.height,
  } satisfies BoxFractions;
}

export function fromFractions(
  fractions: BoxFractions,
  screen: { width: number; height: number },
): PrompterBox {
  return {
    left: fractions.x * screen.width,
    top: fractions.y * screen.height,
    width: fractions.width * screen.width,
    height: fractions.height * screen.height,
  };
}

/**
 * The box to show: the user's saved box (scaled to this screen and kept inside
 * the bounds) or, when there is none, the default layout next to the lens.
 */
export function resolvePrompterBox(
  defaultBox: PrompterBox,
  saved: BoxFractions | undefined,
  screen: { width: number; height: number },
  bounds: Bounds,
): PrompterBox {
  return saved ? clampBox(fromFractions(saved, screen), bounds) : defaultBox;
}
