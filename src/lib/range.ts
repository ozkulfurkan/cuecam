import { clamp } from './clamp';

function assertRange(min: number, max: number): void {
  if (!(max > min)) {
    throw new RangeError(`range: max (${max}) must be greater than min (${min})`);
  }
}

// Rounds away binary noise such as 0.30000000000000004 to the step's precision.
function roundToStepPrecision(value: number, step: number): number {
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(value.toFixed(decimals));
}

/** Snaps `value` to the nearest multiple of `step` from `min`, inside [min, max]. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  assertRange(min, max);
  if (!(step > 0)) throw new RangeError(`range: step (${step}) must be positive`);
  const snapped = min + Math.round((clamp(value, min, max) - min) / step) * step;
  return roundToStepPrecision(clamp(snapped, min, max), step);
}

/** Position of `value` along [min, max] as 0…1. */
export function valueToRatio(value: number, min: number, max: number): number {
  assertRange(min, max);
  return clamp((value - min) / (max - min), 0, 1);
}

/** Value at `ratio` (0…1) along [min, max], snapped to `step`. */
export function ratioToValue(ratio: number, min: number, max: number, step: number): number {
  assertRange(min, max);
  return snapToStep(min + clamp(ratio, 0, 1) * (max - min), min, max, step);
}

/** Moves `value` by `steps` whole steps (negative = down), staying inside [min, max]. */
export function stepBy(value: number, steps: number, min: number, max: number, step: number) {
  return snapToStep(value + steps * step, min, max, step);
}
