import {
  advanceOffset,
  FONT_SIZE_RANGE,
  lineHeightFor,
  MAX_FRAME_STEP_MS,
  maxScrollOffset,
  pixelsPerSecond,
  SPEED_RANGE,
} from './scroll';

describe('pixelsPerSecond', () => {
  it('scales linearly with speed', () => {
    expect(pixelsPerSecond(8, 36)).toBeCloseTo(2 * pixelsPerSecond(4, 36));
  });

  it('keeps the same lines per second when the text gets bigger', () => {
    const linesPerSecond = (speed: number, size: number) =>
      pixelsPerSecond(speed, size) / lineHeightFor(size);
    expect(linesPerSecond(4, 24)).toBeCloseTo(linesPerSecond(4, 64));
  });

  it('reads at about half a line per second at the default speed', () => {
    const { default: speed } = SPEED_RANGE;
    const size = FONT_SIZE_RANGE.default;
    expect(pixelsPerSecond(speed, size) / lineHeightFor(size)).toBeCloseTo(0.5);
  });
});

describe('advanceOffset', () => {
  it('moves by speed × elapsed time', () => {
    expect(advanceOffset(100, 60, 16, 1000)).toBeCloseTo(100.96);
    expect(advanceOffset(0, 50, 100, 1000)).toBeCloseTo(5);
  });

  it('does not move on the first frame (no previous frame time)', () => {
    expect(advanceOffset(10, 60, null, 1000)).toBe(10);
  });

  it('caps a long frame gap so the text does not jump', () => {
    expect(advanceOffset(0, 100, 2000, 1000)).toBeCloseTo((100 * MAX_FRAME_STEP_MS) / 1000);
  });

  it('stops at the end and never goes negative', () => {
    expect(advanceOffset(995, 100, 100, 1000)).toBe(1000);
    expect(advanceOffset(0, 100, 16, -50)).toBe(0);
    expect(advanceOffset(0, 100, -16, 1000)).toBe(0);
  });
});

describe('maxScrollOffset', () => {
  it('lets the content scroll until its end reaches the viewport bottom', () => {
    expect(maxScrollOffset(1500, 300)).toBe(1200);
  });

  it('is zero when the content fits', () => {
    expect(maxScrollOffset(200, 300)).toBe(0);
  });
});
