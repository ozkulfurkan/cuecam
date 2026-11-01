import { controlsArea, prompterBox } from './layout';

const portrait = {
  screenWidth: 390,
  screenHeight: 844,
  cameraSide: 'top' as const,
  topOffset: 100,
  bottomOffset: 24,
  sideOffset: 16,
};

const landscape = {
  ...portrait,
  screenWidth: 844,
  screenHeight: 390,
  topOffset: 72,
};

describe('portrait', () => {
  it('sits at the top, right under the controls', () => {
    expect(prompterBox(portrait).top).toBe(100);
  });

  it('is a centered, narrow column', () => {
    const box = prompterBox(portrait);
    expect(box.width).toBeCloseTo(390 * 0.72);
    expect(box.left).toBeCloseTo((390 - box.width) / 2);
  });

  it('keeps the column readable on small and large screens', () => {
    expect(prompterBox({ ...portrait, screenWidth: 300 }).width).toBe(240);
    expect(prompterBox({ ...portrait, screenWidth: 1024 }).width).toBe(420);
    // Never wider than the screen itself.
    expect(prompterBox({ ...portrait, screenWidth: 200 }).width).toBe(200);
  });

  it('uses about a third of the screen height', () => {
    expect(prompterBox(portrait).height).toBeCloseTo(844 * 0.3);
    expect(prompterBox({ ...portrait, screenHeight: 400 }).height).toBe(160);
  });

  it('leaves the full width to the controls', () => {
    expect(controlsArea(prompterBox(portrait), 'top', 390, 16)).toEqual({ left: 0, right: 0 });
  });
});

describe('landscape', () => {
  it('hugs the left edge when the camera is on the left', () => {
    const box = prompterBox({ ...landscape, cameraSide: 'left' });
    expect(box.left).toBe(16);
    expect(box.width).toBeCloseTo(844 * 0.4);
  });

  it('hugs the right edge when the camera is on the right', () => {
    const box = prompterBox({ ...landscape, cameraSide: 'right' });
    expect(box.left + box.width).toBeCloseTo(844 - 16);
  });

  it('fills the height between the top controls and the bottom margin', () => {
    const box = prompterBox({ ...landscape, cameraSide: 'left' });
    expect(box.top).toBe(72);
    expect(box.height).toBe(390 - 72 - 24);
  });

  it('gives the controls the side away from the camera', () => {
    const left = prompterBox({ ...landscape, cameraSide: 'left' });
    expect(controlsArea(left, 'left', 844, 16)).toEqual({
      left: left.left + left.width + 16,
      right: 0,
    });

    const right = prompterBox({ ...landscape, cameraSide: 'right' });
    expect(controlsArea(right, 'right', 844, 16)).toEqual({
      left: 0,
      right: 844 - right.left + 16,
    });
  });
});
