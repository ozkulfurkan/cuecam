// Frame-rate bookkeeping for the development performance panel. The UI-thread
// functions are worklets (they run inside a frame callback); all are pure so
// they can be tested without a device.

/** Frames shorter than this are timing noise, not a real refresh interval. */
const MIN_REFRESH_MS = 4;

/**
 * The display's refresh interval, learned as the shortest frame seen so far
 * (60 Hz → ~16.7 ms, 120 Hz → ~8.3 ms). Starts from 60 Hz.
 */
export function nextRefreshInterval(current: number, frameMs: number): number {
  'worklet';
  if (frameMs < MIN_REFRESH_MS) return current;
  return Math.min(current, frameMs);
}

/** Frames missed during one long frame: 0 for an on-time frame. */
export function droppedFrames(frameMs: number, refreshMs: number): number {
  'worklet';
  if (refreshMs <= 0 || frameMs <= refreshMs * 1.5) return 0;
  return Math.round(frameMs / refreshMs) - 1;
}

/** Frames per second over a window. */
export function fpsOf(frames: number, elapsedMs: number): number {
  'worklet';
  return elapsedMs > 0 ? (frames * 1000) / elapsedMs : 0;
}

/** Lowest one-second FPS so far; the first full window sets it. */
export function nextMinFps(currentMin: number | undefined, windowFps: number): number {
  'worklet';
  return currentMin === undefined ? windowFps : Math.min(currentMin, windowFps);
}

export type PerfSnapshot = {
  uiFps: number;
  uiMinFps?: number;
  jsFps: number;
  jsMinFps?: number;
  droppedFrames: number;
  elapsedSeconds: number;
  /** Hermes JS heap in bytes, when the engine reports it. */
  heapBytes?: number;
};

const pad = (n: number) => String(n).padStart(2, '0');

function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

const withMin = (fps: number, min: number | undefined) =>
  min === undefined ? `${Math.round(fps)}` : `${Math.round(fps)} (min ${Math.round(min)})`;

/** Panel lines, e.g. ["UI 60 (min 57) · JS 59 (min 41)", "drop 3 · heap 42 MB · 02:14"]. */
export function formatPerf(snapshot: PerfSnapshot): string[] {
  const second = [`drop ${snapshot.droppedFrames}`];
  if (snapshot.heapBytes !== undefined) {
    second.push(`heap ${Math.round(snapshot.heapBytes / (1024 * 1024))} MB`);
  }
  second.push(formatElapsed(snapshot.elapsedSeconds));
  return [
    `UI ${withMin(snapshot.uiFps, snapshot.uiMinFps)} · JS ${withMin(snapshot.jsFps, snapshot.jsMinFps)}`,
    second.join(' · '),
  ];
}
