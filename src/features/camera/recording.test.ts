import {
  canStartRecording,
  canStopRecording,
  formatDuration,
  initialRecordingState,
  isRecordingBusy,
  recordingReducer,
  type RecordingEvent,
  type RecordingState,
} from './recording';

const run = (events: RecordingEvent[], from: RecordingState = initialRecordingState) =>
  events.reduce(recordingReducer, from);

const finished: RecordingEvent = {
  type: 'finished',
  recording: { path: '/tmp/a.mp4', durationSeconds: 12 },
};

describe('recordingReducer', () => {
  it('walks through a full recording', () => {
    expect(run([{ type: 'start' }]).status).toBe('starting');
    expect(run([{ type: 'start' }, { type: 'started' }]).status).toBe('recording');
    expect(run([{ type: 'start' }, { type: 'started' }, { type: 'stop' }]).status).toBe('stopping');

    const done = run([{ type: 'start' }, { type: 'started' }, { type: 'stop' }, finished]);
    expect(done).toEqual({
      status: 'idle',
      lastRecording: { path: '/tmp/a.mp4', durationSeconds: 12 },
    });
  });

  it('ignores a second start or an early stop', () => {
    expect(run([{ type: 'start' }, { type: 'start' }]).status).toBe('starting');
    expect(run([{ type: 'start' }, { type: 'stop' }]).status).toBe('starting');
    expect(run([{ type: 'stop' }]).status).toBe('idle');
  });

  it('accepts a recording that finishes on its own', () => {
    expect(run([{ type: 'start' }, { type: 'started' }, finished]).status).toBe('idle');
  });

  it('returns to idle with the error on failure and clears it on the next start', () => {
    const failed = run([{ type: 'start' }, { type: 'failed', message: 'busy' }]);
    expect(failed).toMatchObject({ status: 'idle', error: 'busy' });
    expect(recordingReducer(failed, { type: 'start' }).error).toBeUndefined();
  });

  it('keeps the previous recording while a new one starts', () => {
    const afterFirst = run([{ type: 'start' }, { type: 'started' }, { type: 'stop' }, finished]);
    expect(run([{ type: 'start' }], afterFirst).lastRecording?.path).toBe('/tmp/a.mp4');
  });
});

describe('guards', () => {
  it('reflects the status', () => {
    const recording = run([{ type: 'start' }, { type: 'started' }]);
    expect(canStartRecording(initialRecordingState)).toBe(true);
    expect(canStartRecording(recording)).toBe(false);
    expect(canStopRecording(recording)).toBe(true);
    expect(canStopRecording(run([{ type: 'start' }]))).toBe(false);
    expect(isRecordingBusy(initialRecordingState)).toBe(false);
    expect(isRecordingBusy(run([{ type: 'start' }]))).toBe(true);
  });
});

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(7.9)).toBe('00:07');
    expect(formatDuration(754)).toBe('12:34');
  });

  it('adds hours past an hour', () => {
    expect(formatDuration(3723)).toBe('1:02:03');
  });

  it('never goes negative', () => {
    expect(formatDuration(-3)).toBe('00:00');
  });
});

describe('interruptions', () => {
  const recording: RecordingEvent[] = [{ type: 'start' }, { type: 'started' }];

  it('stops a running take and flags the finished file', () => {
    const stopping = run([...recording, { type: 'interrupted', cause: 'app-background' }]);
    expect(stopping).toMatchObject({ status: 'stopping', interruptedBy: 'app-background' });

    const done = run([finished], stopping);
    expect(done).toEqual({
      status: 'idle',
      lastRecording: { path: '/tmp/a.mp4', durationSeconds: 12, interruptedBy: 'app-background' },
    });
  });

  it('keeps the first cause when several arrive', () => {
    const state = run([
      ...recording,
      { type: 'interrupted', cause: 'audio-in-use' },
      { type: 'interrupted', cause: 'app-background' },
    ]);
    expect(state.interruptedBy).toBe('audio-in-use');
  });

  it('remembers an interruption that arrives while the recorder is starting', () => {
    const state = run([{ type: 'start' }, { type: 'interrupted', cause: 'app-background' }]);
    expect(state).toMatchObject({ status: 'starting', interruptedBy: 'app-background' });
  });

  it('ignores interruptions while idle or after the user pressed stop', () => {
    expect(run([{ type: 'interrupted', cause: 'app-background' }])).toEqual(initialRecordingState);
    const stopped = run([
      ...recording,
      { type: 'stop' },
      { type: 'interrupted', cause: 'app-background' },
    ]);
    expect(stopped.interruptedBy).toBeUndefined();
    expect(run([finished], stopped).lastRecording?.interruptedBy).toBeUndefined();
  });

  it('keeps a rescued file from a take that errored, without an error message', () => {
    const rescued = { path: '/tmp/b.mp4', durationSeconds: 30 };
    const state = run([
      ...recording,
      { type: 'interrupted', cause: 'audio-in-use' },
      { type: 'failed', message: 'Session was interrupted', rescued },
    ]);
    expect(state).toEqual({
      status: 'idle',
      lastRecording: { ...rescued, interruptedBy: 'audio-in-use' },
    });
  });

  it('marks a rescued take without a known cause as a recording error', () => {
    const state = run([
      ...recording,
      { type: 'failed', message: 'boom', rescued: { path: '/tmp/c.mp4', durationSeconds: 3 } },
    ]);
    expect(state.lastRecording?.interruptedBy).toBe('recording-error');
    expect(state.error).toBeUndefined();
  });

  it('starts the next take clean', () => {
    const state = run([
      ...recording,
      { type: 'interrupted', cause: 'app-background' },
      finished,
      { type: 'start' },
    ]);
    expect(state.status).toBe('starting');
    expect(state.interruptedBy).toBeUndefined();
  });
});
