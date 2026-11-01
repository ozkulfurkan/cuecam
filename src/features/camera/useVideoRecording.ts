import * as Sentry from '@sentry/react-native';
import { useEffect, useReducer, useRef, useState } from 'react';
import type { CameraVideoOutput, Recorder } from 'react-native-vision-camera';

import {
  canStartRecording,
  canStopRecording,
  initialRecordingState,
  recordingReducer,
  type FinishedRecording,
} from './recording';

// The counter only drives on-screen text, so a JS timer is fine here (unlike
// the prompter scroll, which must run on the UI thread).
const ELAPSED_POLL_MS = 250;

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

type Options = {
  /** Called once a recording's file is fully written. */
  onFinished?: (recording: FinishedRecording) => void;
};

export function useVideoRecording(videoOutput: CameraVideoOutput, { onFinished }: Options = {}) {
  const [state, dispatch] = useReducer(recordingReducer, initialRecordingState);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const recorderRef = useRef<Recorder | undefined>(undefined);
  // recordedDuration reads 0 once the recorder stops, so keep the last value
  // to report the length of the finished file.
  const lastElapsedRef = useRef(0);

  useEffect(() => {
    if (state.status !== 'recording') return;
    const timer = setInterval(() => {
      const seconds = recorderRef.current?.recordedDuration ?? 0;
      lastElapsedRef.current = seconds;
      setElapsedSeconds(seconds);
    }, ELAPSED_POLL_MS);
    return () => clearInterval(timer);
  }, [state.status]);

  const fail = (error: unknown) => {
    Sentry.captureException(error);
    recorderRef.current = undefined;
    dispatch({ type: 'failed', message: errorMessage(error) });
  };

  const start = async () => {
    if (!canStartRecording(state)) return;
    dispatch({ type: 'start' });
    setElapsedSeconds(0);
    lastElapsedRef.current = 0;
    try {
      // One Recorder per file; it writes to a temporary file in the app cache.
      const recorder = await videoOutput.createRecorder({});
      recorderRef.current = recorder;
      await recorder.startRecording((path) => {
        recorderRef.current = undefined;
        const recording = { path, durationSeconds: lastElapsedRef.current };
        dispatch({ type: 'finished', recording });
        onFinished?.(recording);
      }, fail);
      dispatch({ type: 'started' });
    } catch (error) {
      fail(error);
    }
  };

  const stop = async () => {
    if (!canStopRecording(state) || recorderRef.current === undefined) return;
    dispatch({ type: 'stop' });
    try {
      // Resolves on request; 'finished' arrives through the start callback once
      // the file is fully written.
      await recorderRef.current.stopRecording();
    } catch (error) {
      fail(error);
    }
  };

  return { state, elapsedSeconds, start, stop };
}
