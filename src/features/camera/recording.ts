export type RecordingStatus = 'idle' | 'starting' | 'recording' | 'stopping';

export type FinishedRecording = {
  /** Filesystem path (not a file:// URL) of the finished video. */
  path: string;
  durationSeconds: number;
};

export type RecordingState = {
  status: RecordingStatus;
  lastRecording?: FinishedRecording;
  error?: string;
};

export type RecordingEvent =
  | { type: 'start' }
  | { type: 'started' }
  | { type: 'stop' }
  | { type: 'finished'; recording: FinishedRecording }
  | { type: 'failed'; message: string };

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
    case 'finished':
      // Also accepted while 'recording': the recorder can finish on its own
      // (max duration/size, or the OS stopping it).
      return { status: 'idle', lastRecording: event.recording };
    case 'failed':
      return { ...state, status: 'idle', error: event.message };
  }
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
