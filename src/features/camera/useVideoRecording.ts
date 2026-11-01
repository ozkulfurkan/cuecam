import * as Sentry from '@sentry/react-native';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { CameraVideoOutput, Recorder } from 'react-native-vision-camera';

import { fileExists } from './fileExists';
import { shouldRescueAfterError, type InterruptionCause } from './interruption';
import {
  canStartRecording,
  canStopRecording,
  initialRecordingState,
  recordingReducer,
  type FinishedRecording,
  type RecordingState,
} from './recording';

// The counter only drives on-screen text, so a JS timer is fine here (unlike
// the prompter scroll, which must run on the UI thread).
const ELAPSED_POLL_MS = 250;

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

async function requestStop(recorder: Recorder) {
  try {
    // Resolves on request; 'finished' arrives through the start callback once
    // the file is fully written.
    await recorder.stopRecording();
  } catch (error) {
    // The recorder may already be finishing on its own (e.g. the OS stopped
    // it); its own callbacks report the outcome.
    Sentry.captureException(error);
  }
}

type Options = {
  /** Called once a recording's file is fully written (also for rescued takes). */
  onFinished?: (recording: FinishedRecording) => void;
};

export function useVideoRecording(videoOutput: CameraVideoOutput, { onFinished }: Options = {}) {
  const [state, dispatch] = useReducer(recordingReducer, initialRecordingState);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const recorderRef = useRef<Recorder | undefined>(undefined);
  // recordedDuration reads 0 once the recorder stops, so keep the last value
  // to report the length of the finished file.
  const lastElapsedRef = useRef(0);
  // Interruptions arrive from native listeners, outside React's render cycle;
  // they read the latest state from here.
  const stateRef = useRef<RecordingState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (state.status !== 'recording') return;
    const timer = setInterval(() => {
      const seconds = recorderRef.current?.recordedDuration ?? 0;
      lastElapsedRef.current = seconds;
      // The screen shows whole seconds. Storing the whole second means React
      // skips the update (same value) on 3 of every 4 polls, instead of
      // re-rendering the whole recorder 4 times a second for a long take.
      setElapsedSeconds(Math.floor(seconds));
    }, ELAPSED_POLL_MS);
    return () => clearInterval(timer);
  }, [state.status]);

  const finish = (recording: FinishedRecording) => {
    onFinishedRef.current?.(recording);
  };

  /** `maxFileSize`: stop cleanly before the disk fills up (see storageSpace.ts). */
  const start = async ({ maxFileSize }: { maxFileSize?: number } = {}) => {
    if (!canStartRecording(stateRef.current)) return;
    dispatch({ type: 'start' });
    stateRef.current = { ...stateRef.current, status: 'starting' };
    setElapsedSeconds(0);
    lastElapsedRef.current = 0;
    let started = false;
    try {
      // One Recorder per file; it writes to a temporary file in the app cache.
      const recorder = await videoOutput.createRecorder(
        maxFileSize === undefined ? {} : { maxFileSize },
      );
      recorderRef.current = recorder;
      await recorder.startRecording(
        (path, reason) => {
          recorderRef.current = undefined;
          const recording: FinishedRecording = {
            path,
            durationSeconds: lastElapsedRef.current,
            // The size limit is only set from free space, so hitting it means
            // the disk was about to fill up.
            ...(reason === 'max-file-size-reached' ? { interruptedBy: 'storage-full' } : {}),
          };
          dispatch({ type: 'finished', recording });
          finish({
            ...recording,
            interruptedBy: stateRef.current.interruptedBy ?? recording.interruptedBy,
          });
        },
        (error) => {
          // Mid-take error: on iOS this is also how an interruption (phone
          // call, backgrounding) ends a take, although the file is usable.
          recorderRef.current = undefined;
          Sentry.captureException(error);
          const path = recorder.filePath;
          if (shouldRescueAfterError(started, fileExists(path))) {
            const rescued: FinishedRecording = {
              path,
              durationSeconds: lastElapsedRef.current,
              interruptedBy: stateRef.current.interruptedBy ?? 'recording-error',
            };
            dispatch({ type: 'failed', message: errorMessage(error), rescued });
            finish(rescued);
          } else {
            dispatch({ type: 'failed', message: errorMessage(error) });
          }
        },
      );
      started = true;
      dispatch({ type: 'started' });
      stateRef.current = { ...stateRef.current, status: 'recording' };
      // Interrupted while the recorder was starting: end the take right away.
      if (stateRef.current.interruptedBy !== undefined) {
        dispatch({ type: 'interrupted', cause: stateRef.current.interruptedBy });
        stateRef.current = { ...stateRef.current, status: 'stopping' };
        await requestStop(recorder);
      }
    } catch (error) {
      Sentry.captureException(error);
      recorderRef.current = undefined;
      dispatch({ type: 'failed', message: errorMessage(error) });
    }
  };

  const stop = async () => {
    const recorder = recorderRef.current;
    if (!canStopRecording(stateRef.current) || recorder === undefined) return;
    dispatch({ type: 'stop' });
    stateRef.current = { ...stateRef.current, status: 'stopping' };
    await requestStop(recorder);
  };

  /**
   * Ends the take because of an interruption (backgrounding, a call, the OS
   * taking the camera). The file written so far is finished and saved like a
   * normal take, flagged with the cause so the screen can say what happened.
   */
  // Stable identity: screens subscribe it to AppState/camera listeners once.
  const interrupt = useCallback(async (cause: InterruptionCause) => {
    const current = stateRef.current;
    if (current.status !== 'recording' && current.status !== 'starting') return;
    Sentry.addBreadcrumb?.({ category: 'recording', message: `interrupted: ${cause}` });
    dispatch({ type: 'interrupted', cause });
    stateRef.current = recordingReducer(current, { type: 'interrupted', cause });
    const recorder = recorderRef.current;
    if (current.status === 'recording' && recorder !== undefined) {
      await requestStop(recorder);
    }
  }, []);

  return { state, elapsedSeconds, start, stop, interrupt };
}
