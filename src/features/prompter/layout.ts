/**
 * Where the prompter text box sits. Product rule: at the top of the screen,
 * close to the front camera, in a narrow column — so the reader's eyes stay
 * near the lens and the recording looks like eye contact.
 */
export type PrompterBox = { top: number; left: number; width: number; height: number };

type Input = {
  screenWidth: number;
  screenHeight: number;
  /** Space taken at the top (safe-area inset + the top row of controls). */
  topOffset: number;
};

// Narrow enough that the eyes barely move sideways while reading, wide enough
// for ~5 words per line at the default text size.
const WIDTH_RATIO = 0.72;
const MIN_WIDTH = 240;
const MAX_WIDTH = 420;
// Tall enough for a few lines of context, short enough to keep the gaze high.
const HEIGHT_RATIO = 0.3;
const MIN_HEIGHT = 160;

export function prompterBox({ screenWidth, screenHeight, topOffset }: Input): PrompterBox {
  const width = Math.min(Math.max(screenWidth * WIDTH_RATIO, MIN_WIDTH), MAX_WIDTH, screenWidth);
  const height = Math.max(screenHeight * HEIGHT_RATIO, MIN_HEIGHT);
  return {
    top: topOffset,
    left: (screenWidth - width) / 2,
    width,
    height,
  };
}
