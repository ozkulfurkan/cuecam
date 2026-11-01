import { COUNTDOWN_SECONDS, countdownValue } from './countdown';

it('counts 3, 2, 1 and then goes', () => {
  expect(COUNTDOWN_SECONDS).toBe(3);
  expect([0, 1, 2, 3].map((s) => countdownValue(s))).toEqual([3, 2, 1, undefined]);
});

it('ignores fractions of a second', () => {
  expect(countdownValue(0.9)).toBe(3);
  expect(countdownValue(2.99)).toBe(1);
});
