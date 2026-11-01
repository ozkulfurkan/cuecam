import type { CameraSide } from '@/features/camera/orientation';

/**
 * Where the prompter text box sits. Product rule: close to the front camera,
 * in a narrow column — so the reader's eyes stay near the lens and the
 * recording looks like eye contact. In portrait the camera is at the top; in
 * landscape it is on the left or right edge, so the box moves to that edge.
 */
export type PrompterBox = { top: number; left: number; width: number; height: number };

type Input = {
  screenWidth: number;
  screenHeight: number;
  cameraSide: CameraSide;
  /** Space taken at the top (safe-area inset + the top row of controls). */
  topOffset: number;
  /** Space kept free at the bottom in landscape (safe-area inset + margin). */
  bottomOffset: number;
  /** Distance from the left/right screen edge in landscape (safe-area inset + margin). */
  sideOffset: number;
};

// Narrow enough that the eyes barely move sideways while reading, wide enough
// for ~5 words per line at the default text size.
const PORTRAIT_WIDTH_RATIO = 0.72;
const LANDSCAPE_WIDTH_RATIO = 0.4;
const MIN_WIDTH = 240;
const MAX_WIDTH = 420;
// Portrait: tall enough for a few lines of context, short enough to keep the gaze high.
const PORTRAIT_HEIGHT_RATIO = 0.3;
const MIN_HEIGHT = 160;

const columnWidth = (screenWidth: number, ratio: number) =>
  Math.min(Math.max(screenWidth * ratio, MIN_WIDTH), MAX_WIDTH, screenWidth);

export function prompterBox(input: Input): PrompterBox {
  const { screenWidth, screenHeight, cameraSide, topOffset } = input;

  if (cameraSide === 'top') {
    const width = columnWidth(screenWidth, PORTRAIT_WIDTH_RATIO);
    return {
      top: topOffset,
      left: (screenWidth - width) / 2,
      width,
      height: Math.max(screenHeight * PORTRAIT_HEIGHT_RATIO, MIN_HEIGHT),
    };
  }

  // Landscape: a column hugging the camera edge, using the full free height
  // (the screen is short, and the camera sits at mid-height on that edge).
  const width = columnWidth(screenWidth, LANDSCAPE_WIDTH_RATIO);
  return {
    top: topOffset,
    left: cameraSide === 'left' ? input.sideOffset : screenWidth - width - input.sideOffset,
    width,
    height: Math.max(screenHeight - topOffset - input.bottomOffset, MIN_HEIGHT),
  };
}

/**
 * The strip left for the controls (sliders, record button): the full width in
 * portrait, the side away from the camera in landscape.
 */
export function controlsArea(
  box: PrompterBox,
  cameraSide: CameraSide,
  screenWidth: number,
  gap: number,
): { left: number; right: number } {
  if (cameraSide === 'left') return { left: box.left + box.width + gap, right: 0 };
  if (cameraSide === 'right') return { left: 0, right: screenWidth - box.left + gap };
  return { left: 0, right: 0 };
}
