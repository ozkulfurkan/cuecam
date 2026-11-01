import { ratioToValue, snapToStep, stepBy, valueToRatio } from './range';

describe('snapToStep', () => {
  it('snaps to the nearest step from min', () => {
    expect(snapToStep(7, 0, 100, 5)).toBe(5);
    expect(snapToStep(8, 0, 100, 5)).toBe(10);
    expect(snapToStep(12, 2, 100, 5)).toBe(12);
  });

  it('clamps into range', () => {
    expect(snapToStep(-10, 0, 100, 5)).toBe(0);
    expect(snapToStep(250, 0, 100, 5)).toBe(100);
  });

  it('keeps decimal steps free of float noise', () => {
    expect(snapToStep(0.3, 0, 1, 0.1)).toBe(0.3);
    expect(snapToStep(0.74, 0.5, 2, 0.25)).toBe(0.75);
  });

  it('rejects bad ranges and steps', () => {
    expect(() => snapToStep(1, 5, 5, 1)).toThrow(RangeError);
    expect(() => snapToStep(1, 0, 10, 0)).toThrow(RangeError);
  });
});

describe('valueToRatio', () => {
  it('maps the range onto 0…1', () => {
    expect(valueToRatio(10, 10, 20)).toBe(0);
    expect(valueToRatio(15, 10, 20)).toBe(0.5);
    expect(valueToRatio(20, 10, 20)).toBe(1);
  });

  it('clamps values outside the range', () => {
    expect(valueToRatio(0, 10, 20)).toBe(0);
    expect(valueToRatio(99, 10, 20)).toBe(1);
  });
});

describe('ratioToValue', () => {
  it('maps 0…1 back onto the range, snapped to step', () => {
    expect(ratioToValue(0, 10, 20, 1)).toBe(10);
    expect(ratioToValue(0.53, 10, 20, 1)).toBe(15);
    expect(ratioToValue(1, 10, 20, 1)).toBe(20);
  });

  it('clamps ratios outside 0…1', () => {
    expect(ratioToValue(-0.5, 10, 20, 1)).toBe(10);
    expect(ratioToValue(1.5, 10, 20, 1)).toBe(20);
  });

  it('round-trips with valueToRatio', () => {
    expect(ratioToValue(valueToRatio(35, 0, 100), 0, 100, 5)).toBe(35);
  });
});

describe('stepBy', () => {
  it('moves by whole steps and stops at the ends', () => {
    expect(stepBy(10, 1, 0, 20, 2)).toBe(12);
    expect(stepBy(10, -1, 0, 20, 2)).toBe(8);
    expect(stepBy(20, 1, 0, 20, 2)).toBe(20);
    expect(stepBy(0, -1, 0, 20, 2)).toBe(0);
  });
});
