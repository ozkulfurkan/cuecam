import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';

import { radius, spacing, textStyles, useTheme } from '@/theme';

import {
  droppedFrames,
  formatPerf,
  fpsOf,
  nextMinFps,
  nextRefreshInterval,
  type PerfSnapshot,
} from './frameStats';

const WINDOW_MS = 1000;
const NO_VALUE = -1;
const DEFAULT_REFRESH_MS = 1000 / 60;

type HermesGlobal = {
  HermesInternal?: { getInstrumentedStats?: () => { js_heapSize?: number } };
};

function readHeapBytes(): number | undefined {
  try {
    return (globalThis as HermesGlobal).HermesInternal?.getInstrumentedStats?.().js_heapSize;
  } catch {
    return undefined;
  }
}

type Props = {
  /** Change it (e.g. when a take starts) to restart the stats and the clock. */
  resetKey: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Development-only overlay for long-take testing (PRM-27): UI-thread FPS (the
 * thread that scrolls the prompter), JS-thread FPS, the worst one-second FPS
 * of each, dropped UI frames, the Hermes JS heap (to spot leaks) and the time
 * since the last reset. Render it only under __DEV__; it costs a frame
 * callback and a JS animation-frame loop.
 */
export function PerfPanel({ resetKey, style }: Props) {
  const { colors } = useTheme();

  // UI thread: updated inside the frame callback, read by JS once a second.
  const uiWindowStart = useSharedValue(NO_VALUE);
  const uiWindowFrames = useSharedValue(0);
  const uiFps = useSharedValue(0);
  const uiMinFps = useSharedValue(NO_VALUE);
  const uiDropped = useSharedValue(0);
  const refreshMs = useSharedValue(DEFAULT_REFRESH_MS);

  useFrameCallback((frame) => {
    const now = frame.timestamp;
    const frameMs = frame.timeSincePreviousFrame;
    if (frameMs !== null) {
      refreshMs.set(nextRefreshInterval(refreshMs.get(), frameMs));
      uiDropped.set(uiDropped.get() + droppedFrames(frameMs, refreshMs.get()));
    }
    if (uiWindowStart.get() === NO_VALUE) {
      uiWindowStart.set(now);
      uiWindowFrames.set(0);
      return;
    }
    uiWindowFrames.set(uiWindowFrames.get() + 1);
    const elapsed = now - uiWindowStart.get();
    if (elapsed >= WINDOW_MS) {
      const fps = fpsOf(uiWindowFrames.get(), elapsed);
      uiFps.set(fps);
      const min = uiMinFps.get();
      uiMinFps.set(nextMinFps(min === NO_VALUE ? undefined : min, fps));
      uiWindowStart.set(now);
      uiWindowFrames.set(0);
    }
  });

  // JS thread: an animation-frame loop counts how often JS gets to run.
  const js = useRef({ windowStart: 0, frames: 0, fps: 0, minFps: undefined as number | undefined });
  // Set by the reset effect below (on mount and on every resetKey change).
  const startedAt = useRef(0);
  const [snapshot, setSnapshot] = useState<PerfSnapshot>({
    uiFps: 0,
    jsFps: 0,
    droppedFrames: 0,
    elapsedSeconds: 0,
  });

  useEffect(() => {
    // Restart everything for a new take.
    uiWindowStart.set(NO_VALUE);
    uiMinFps.set(NO_VALUE);
    uiDropped.set(0);
    js.current = { windowStart: 0, frames: 0, fps: 0, minFps: undefined };
    startedAt.current = Date.now();
  }, [resetKey, uiWindowStart, uiMinFps, uiDropped]);

  useEffect(() => {
    let handle = 0;
    const tick = (now: number) => {
      const stats = js.current;
      if (stats.windowStart === 0) {
        stats.windowStart = now;
      } else {
        stats.frames += 1;
        const elapsed = now - stats.windowStart;
        if (elapsed >= WINDOW_MS) {
          stats.fps = fpsOf(stats.frames, elapsed);
          stats.minFps = nextMinFps(stats.minFps, stats.fps);
          stats.windowStart = now;
          stats.frames = 0;
        }
      }
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);

    // One React update per second; the panel itself must not load JS.
    const timer = setInterval(() => {
      const uiMin = uiMinFps.get();
      setSnapshot({
        uiFps: uiFps.get(),
        uiMinFps: uiMin === NO_VALUE ? undefined : uiMin,
        jsFps: js.current.fps,
        jsMinFps: js.current.minFps,
        droppedFrames: uiDropped.get(),
        elapsedSeconds: (Date.now() - startedAt.current) / 1000,
        heapBytes: readHeapBytes(),
      });
    }, WINDOW_MS);

    return () => {
      cancelAnimationFrame(handle);
      clearInterval(timer);
    };
  }, [uiFps, uiMinFps, uiDropped]);

  return (
    <View
      testID="perf-panel"
      pointerEvents="none"
      style={[styles.panel, { backgroundColor: colors.scrim }, style]}
    >
      {formatPerf(snapshot).map((line) => (
        <Text key={line} style={[textStyles.caption, { color: colors.onScrim }]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
});
