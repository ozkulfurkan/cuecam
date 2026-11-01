export const COUNTDOWN_SECONDS = 3;

/** Value shown after `elapsedSeconds` whole seconds: 3, 2, 1, then undefined (go). */
export function countdownValue(elapsedSeconds: number, from = COUNTDOWN_SECONDS) {
  const remaining = from - Math.floor(elapsedSeconds);
  return remaining > 0 ? remaining : undefined;
}
