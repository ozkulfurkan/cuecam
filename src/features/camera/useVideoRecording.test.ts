import { act, renderHook } from '@testing-library/react-native';
import { useEffect } from 'react';
import * as visionCameraModule from 'react-native-vision-camera';

import { useVideoRecording } from './useVideoRecording';

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

type MockRecorder = { recordedDuration: number; finishNow: (reason?: string) => void };
const visionCamera = visionCameraModule as unknown as {
  useVideoOutput: () => Parameters<typeof useVideoRecording>[0];
  mockRecorders: MockRecorder[];
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  visionCamera.mockRecorders.length = 0;
  jest.useRealTimers();
});

it('re-renders once per second of recording, not on every poll', async () => {
  // Counted per commit (an effect without deps), so Strict Mode's double
  // render in development does not count twice.
  let renders = 0;
  const { result } = await renderHook(() => {
    useEffect(() => {
      renders += 1;
    });
    return useVideoRecording(visionCamera.useVideoOutput());
  });
  await act(() => result.current.start());
  const recorder = visionCamera.mockRecorders[0];
  const before = renders;

  // Ten seconds; the native duration grows continuously between polls.
  for (let ms = 0; ms < 10_000; ms += 50) {
    recorder.recordedDuration = (ms + 50) / 1000;
    await act(() => jest.advanceTimersByTime(50));
  }

  expect(result.current.elapsedSeconds).toBe(10);
  // One render per whole second (the old fractional state gave ~40).
  expect(renders - before).toBeLessThanOrEqual(11);
});

it('reports the precise duration of the finished file', async () => {
  const onFinished = jest.fn();
  const { result } = await renderHook(() =>
    useVideoRecording(visionCamera.useVideoOutput(), { onFinished }),
  );
  await act(() => result.current.start());
  const recorder = visionCamera.mockRecorders[0];
  recorder.recordedDuration = 7.6;
  await act(() => jest.advanceTimersByTime(300));
  await act(() => result.current.stop());
  await act(async () => recorder.finishNow());

  expect(onFinished).toHaveBeenCalledWith(expect.objectContaining({ durationSeconds: 7.6 }));
  expect(result.current.elapsedSeconds).toBe(7);
});
