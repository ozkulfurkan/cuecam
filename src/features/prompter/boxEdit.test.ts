import {
  clampBox,
  fromFractions,
  MIN_BOX_SIZE,
  moveBox,
  resizeBox,
  resolvePrompterBox,
  toFractions,
  type Bounds,
} from './boxEdit';

const bounds: Bounds = { left: 10, top: 20, right: 390, bottom: 820 };
const box = { left: 50, top: 100, width: 280, height: 250 };

describe('moveBox', () => {
  it('follows the drag', () => {
    expect(moveBox(box, 20, 300, bounds)).toEqual({ ...box, left: 70, top: 400 });
  });

  it('stops at the edges of the bounds', () => {
    expect(moveBox(box, -500, -500, bounds)).toMatchObject({ left: 10, top: 20 });
    expect(moveBox(box, 500, 2000, bounds)).toMatchObject({
      left: 390 - box.width,
      top: 820 - box.height,
    });
  });

  it('never changes the size', () => {
    const moved = moveBox(box, 999, 999, bounds);
    expect([moved.width, moved.height]).toEqual([box.width, box.height]);
  });
});

describe('resizeBox', () => {
  it('grows and shrinks from the bottom-right corner, keeping the top-left fixed', () => {
    expect(resizeBox(box, 30, -50, bounds)).toEqual({ ...box, width: 310, height: 200 });
  });

  it('keeps a minimum size', () => {
    expect(resizeBox(box, -1000, -1000, bounds)).toMatchObject({
      left: box.left,
      top: box.top,
      ...MIN_BOX_SIZE,
    });
  });

  it('cannot grow past the bounds', () => {
    expect(resizeBox(box, 1000, 1000, bounds)).toMatchObject({
      left: box.left,
      top: box.top,
      width: 390 - box.left,
      height: 820 - box.top,
    });
  });
});

describe('clampBox', () => {
  it('pulls an off-screen box back in', () => {
    expect(clampBox({ left: 380, top: 900, width: 200, height: 150 }, bounds)).toEqual({
      left: 190,
      top: 670,
      width: 200,
      height: 150,
    });
  });

  it('shrinks a box larger than the bounds (e.g. after rotating)', () => {
    const tiny: Bounds = { left: 0, top: 0, right: 300, bottom: 200 };
    expect(clampBox({ left: 0, top: 0, width: 500, height: 400 }, tiny)).toEqual({
      left: 0,
      top: 0,
      width: 300,
      height: 200,
    });
  });
});

describe('fractions', () => {
  it('round-trips through another screen size proportionally', () => {
    const fractions = toFractions(box, { width: 400, height: 800 });
    expect(fractions).toEqual({ x: 0.125, y: 0.125, width: 0.7, height: 0.3125 });
    expect(fromFractions(fractions, { width: 800, height: 1600 })).toEqual({
      left: 100,
      top: 200,
      width: 560,
      height: 500,
    });
  });
});

describe('resolvePrompterBox', () => {
  const screenSize = { width: 400, height: 840 };

  it('uses the default layout when nothing is saved', () => {
    expect(resolvePrompterBox(box, undefined, screenSize, bounds)).toBe(box);
  });

  it('scales a saved box to the screen and keeps it inside the bounds', () => {
    const saved = { x: 0.5, y: 0.5, width: 0.6, height: 0.2 };
    expect(resolvePrompterBox(box, saved, screenSize, bounds)).toEqual({
      left: 150, // 200 would push the 240-wide box past the right bound (390)
      top: 420,
      width: 240,
      height: 168,
    });
  });
});
