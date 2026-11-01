import { useEffect, useRef, useState } from 'react';

import { COUNTDOWN_SECONDS, countdownValue } from './countdown';

// Ticks only update the big on-screen number, so a JS timer is fine here.
const TICK_MS = 100;

/**
 * 3-2-1 countdown. `start(onDone)` shows 3, 2, 1 one second apart and then
 * calls `onDone`; `cancel()` stops it without calling it.
 */
export function useCountdown(from = COUNTDOWN_SECONDS) {
  const [value, setValue] = useState<number>();
  const startedAt = useRef<number | undefined>(undefined);
  const onDoneRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (value === undefined) return;
    const timer = setInterval(() => {
      if (startedAt.current === undefined) return;
      const next = countdownValue((Date.now() - startedAt.current) / 1000, from);
      setValue(next);
      if (next === undefined) {
        startedAt.current = undefined;
        onDoneRef.current?.();
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [value, from]);

  return {
    value,
    isRunning: value !== undefined,
    start: (onDone: () => void) => {
      onDoneRef.current = onDone;
      startedAt.current = Date.now();
      setValue(from);
    },
    cancel: () => {
      startedAt.current = undefined;
      onDoneRef.current = undefined;
      setValue(undefined);
    },
  };
}
