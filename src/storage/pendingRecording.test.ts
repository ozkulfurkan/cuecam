import {
  clearPendingRecording,
  loadPendingRecording,
  savePendingRecording,
} from './pendingRecording';
import { storage } from './storage';

beforeEach(() => storage.clearAll());

it('round-trips a pending take', () => {
  const recording = {
    path: '/tmp/a.mp4',
    durationSeconds: 42,
    interruptedBy: 'app-background' as const,
  };
  savePendingRecording(recording);
  expect(loadPendingRecording()).toEqual(recording);

  clearPendingRecording();
  expect(loadPendingRecording()).toBeUndefined();
});

it('drops corrupt entries instead of crashing', () => {
  storage.set('recorder.pendingRecording.v1', '{not json');
  expect(loadPendingRecording()).toBeUndefined();

  storage.set('recorder.pendingRecording.v1', JSON.stringify({ path: 3 }));
  expect(loadPendingRecording()).toBeUndefined();
  expect(storage.getString('recorder.pendingRecording.v1')).toBeUndefined();
});
