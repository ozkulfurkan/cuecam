/**
 * Prompter speed is a 1–10 level shown to the user. It maps to lines per
 * second, so the reading pace stays the same when the text size changes:
 * bigger text scrolls more pixels per second to show the same lines.
 *
 * Level 4 ≈ 0.5 lines/s ≈ 150 words per minute in the narrow prompter column
 * (about 5 words per line), a comfortable speaking pace.
 */
export const SPEED_RANGE = { min: 1, max: 10, step: 1, default: 4 } as const;
export const FONT_SIZE_RANGE = { min: 24, max: 64, step: 2, default: 36 } as const;

const LINES_PER_SECOND_PER_LEVEL = 0.125;

/** Prompter text line height as a multiple of its font size. */
export const PROMPTER_LINE_HEIGHT = 1.35;

export function lineHeightFor(fontSize: number): number {
  return Math.round(fontSize * PROMPTER_LINE_HEIGHT);
}

export function pixelsPerSecond(speed: number, fontSize: number): number {
  return speed * LINES_PER_SECOND_PER_LEVEL * lineHeightFor(fontSize);
}

/**
 * Longest step taken in one frame. After the JS thread or the app stalls, the
 * next frame can report a gap of hundreds of milliseconds; capping it keeps the
 * text from visibly jumping ahead of the reader.
 */
export const MAX_FRAME_STEP_MS = 100;

/** Next scroll offset after one frame. Runs on the UI thread. */
export function advanceOffset(
  offset: number,
  pxPerSecond: number,
  elapsedMs: number | null,
  maxOffset: number,
): number {
  'worklet';
  const dt = Math.min(Math.max(elapsedMs ?? 0, 0), MAX_FRAME_STEP_MS);
  return Math.min(Math.max(offset + (pxPerSecond * dt) / 1000, 0), Math.max(maxOffset, 0));
}

/**
 * How far the text can scroll. The content ends with a spacer as tall as the
 * viewport, so the last line can rise all the way to the reading line at the top.
 */
export function maxScrollOffset(contentHeight: number, viewportHeight: number): number {
  'worklet';
  return Math.max(contentHeight - viewportHeight, 0);
}

/** Offset after jumping by `deltaPx` (negative = back), kept inside the script. */
export function jumpOffset(offset: number, deltaPx: number, maxOffset: number): number {
  'worklet';
  return Math.min(Math.max(offset + deltaPx, 0), Math.max(maxOffset, 0));
}

/** Press-and-hold makes the text scroll this many times faster (PRM-35). */
export const BOOST_MULTIPLIER = 2;

/** Scroll speed in px/s, doubled while the user holds the screen. */
export function scrollSpeed(speed: number, fontSize: number, boosted: boolean): number {
  return pixelsPerSecond(speed, fontSize) * (boosted ? BOOST_MULTIPLIER : 1);
}
