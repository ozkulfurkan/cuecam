import { prompterBox } from './layout';

const phone = { screenWidth: 390, screenHeight: 844, topOffset: 100 };

it('sits at the top, right under the controls', () => {
  expect(prompterBox(phone).top).toBe(100);
});

it('is a centered, narrow column', () => {
  const box = prompterBox(phone);
  expect(box.width).toBeCloseTo(390 * 0.72);
  expect(box.left).toBeCloseTo((390 - box.width) / 2);
  expect(box.width).toBeLessThan(390);
});

it('keeps the column readable on small and large screens', () => {
  expect(prompterBox({ ...phone, screenWidth: 300 }).width).toBe(240);
  expect(prompterBox({ ...phone, screenWidth: 1024 }).width).toBe(420);
  // Never wider than the screen itself.
  expect(prompterBox({ ...phone, screenWidth: 200 }).width).toBe(200);
});

it('uses about a third of the screen height', () => {
  expect(prompterBox(phone).height).toBeCloseTo(844 * 0.3);
  expect(prompterBox({ ...phone, screenHeight: 400 }).height).toBe(160);
});
