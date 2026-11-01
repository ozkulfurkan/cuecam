import type { InterruptionCause } from './interruption';

export type RecordingStatus = 'idle' | 'starting' | 'recording' | 'stopping';

export type FinishedRecording = {
  /** Filesystem path (not a file:// URL) of the finished video. */
  path: string;
  durationSeconds: number;
  /** Set when the take ended because of an interruption, not the stop button. */
  interruptedBy?: InterruptionCause;
};

export type RecordingState = {
  status: RecordingStatus;
  lastRecording?: FinishedRecording;
  error?: string;
  /** An interruption that is stopping (or, while starting, will stop) the take. */
  interruptedBy?: InterruptionCause;
};

export type RecordingEvent =
  | { type: 'start' }
  | { type: 'started' }
  | { type: 'stop' }
  | { type: 'interrupted'; cause: InterruptionCause }
  | { type: 'finished'; recording: FinishedRecording }
  /** `rescued`: the take errored but its file was kept (see shouldRescueAfterError). */
  | { type: 'failed'; message: string; rescued?: FinishedRecording };

export const initialRecordingState: RecordingState = { status: 'idle' };

/**
 * Recorder lifecycle. Start and stop are both asynchronous on the native side,
 * so the in-between states block double taps from starting two recordings or
 * stopping one twice.
 */
export function recordingReducer(state: RecordingState, event: RecordingEvent): RecordingState {
  switch (event.type) {
    case 'start':
      return state.status === 'idle' ? { ...state, status: 'starting', error: undefined } : state;
    case 'started':
      return state.status === 'starting' ? { ...state, status: 'recording' } : state;
    case 'stop':
      return state.status === 'recording' ? { ...state, status: 'stopping' } : state;
    case 'interrupted':
      // While recording: stop now. While starting: remember it, the hook stops
      // the take as soon as it has started. The first cause wins.
      if (state.status === 'recording') {
        return { ...state, status: 'stopping', interruptedBy: state.interruptedBy ?? event.cause };
      }
      if (state.status === 'starting') {
        return { ...state, interruptedBy: state.interruptedBy ?? event.cause };
      }
      // Idle: nothing to stop. Stopping: the user already ended the take.
      return state;
    case 'finished':
      // Also accepted while 'recording': the recorder can finish on its own
      // (max duration/size, or the OS stopping it).
      return {
        status: 'idle',
        lastRecording: withInterruption(event.recording, state.interruptedBy),
      };
    case 'failed':
      if (event.rescued) {
        return {
          status: 'idle',
          lastRecording: withInterruption(
            event.rescued,
            state.interruptedBy ?? event.rescued.interruptedBy ?? 'recording-error',
          ),
        };
      }
      return { ...state, status: 'idle', error: event.message, interruptedBy: undefined };
  }
}

function withInterruption(
  recording: FinishedRecording,
  cause: InterruptionCause | undefined,
): FinishedRecording {
  const interruptedBy = cause ?? recording.interruptedBy;
  return interruptedBy ? { ...recording, interruptedBy } : recording;
}

export const canStartRecording = (state: RecordingState) => state.status === 'idle';
export const canStopRecording = (state: RecordingState) => state.status === 'recording';
/** Camera controls (lens switch, close) are locked from start until the file is written. */
export const isRecordingBusy = (state: RecordingState) => state.status !== 'idle';

/** "00:07", "12:34", or "1:02:03" past an hour. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
