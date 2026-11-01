import { clamp } from './clamp';

describe('clamp', () => {
  it('returns the value when inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to the bounds', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it('accepts a single-point range', () => {
    expect(clamp(7, 3, 3)).toBe(3);
  });

  it('throws when min exceeds max', () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });
});
