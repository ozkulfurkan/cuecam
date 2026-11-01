import { droppedFrames, formatPerf, fpsOf, nextMinFps, nextRefreshInterval } from './frameStats';

describe('nextRefreshInterval', () => {
  it('learns the shortest real frame (60 Hz → 120 Hz)', () => {
    expect(nextRefreshInterval(16.7, 16.6)).toBe(16.6);
    expect(nextRefreshInterval(16.6, 8.3)).toBe(8.3);
    expect(nextRefreshInterval(8.3, 33)).toBe(8.3);
  });

  it('ignores timing noise', () => {
    expect(nextRefreshInterval(16.7, 1)).toBe(16.7);
  });
});

describe('droppedFrames', () => {
  it('counts nothing for on-time or slightly late frames', () => {
    expect(droppedFrames(16.7, 16.7)).toBe(0);
    expect(droppedFrames(20, 16.7)).toBe(0);
  });

  it('counts the frames a long frame swallowed', () => {
    expect(droppedFrames(33.4, 16.7)).toBe(1);
    expect(droppedFrames(100, 16.7)).toBe(5);
    expect(droppedFrames(25, 8.3)).toBe(2);
  });
});

describe('fpsOf / nextMinFps', () => {
  it('computes FPS over a window', () => {
    expect(fpsOf(60, 1000)).toBe(60);
    expect(fpsOf(30, 500)).toBe(60);
    expect(fpsOf(10, 0)).toBe(0);
  });

  it('tracks the worst second', () => {
    expect(nextMinFps(undefined, 58)).toBe(58);
    expect(nextMinFps(58, 60)).toBe(58);
    expect(nextMinFps(58, 41)).toBe(41);
  });
});

describe('formatPerf', () => {
  it('shows FPS, worst FPS, drops, heap and elapsed time', () => {
    expect(
      formatPerf({
        uiFps: 59.6,
        uiMinFps: 57.2,
        jsFps: 58.9,
        jsMinFps: 40.6,
        droppedFrames: 3,
        elapsedSeconds: 134.8,
        heapBytes: 42 * 1024 * 1024,
      }),
    ).toEqual(['UI 60 (min 57) · JS 59 (min 41)', 'drop 3 · heap 42 MB · 02:14']);
  });

  it('leaves out what is not known yet', () => {
    expect(formatPerf({ uiFps: 0, jsFps: 0, droppedFrames: 0, elapsedSeconds: 3725 })).toEqual([
      'UI 0 · JS 0',
      'drop 0 · 1:02:05',
    ]);
  });
});
