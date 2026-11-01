import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as mediaLibraryModule from 'expo-media-library';
import * as fileSystemModule from 'expo-file-system';
import { AppState, StyleSheet, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as reanimatedModule from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as visionCameraModule from 'react-native-vision-camera';

import { savePendingRecording } from '@/storage/pendingRecording';
import { storage } from '@/storage/storage';

import { Recorder } from './Recorder';

type MockRecorder = {
  recordedDuration: number;
  filePath: string;
  finishNow: (reason?: string) => void;
  failNow: (message: string) => void;
};

// Helpers from __mocks__/react-native-vision-camera.ts (same import path as the
// component, so both share one mock instance).
const visionCamera = visionCameraModule as unknown as {
  setMockDevices: (positions: ('front' | 'back' | 'external')[]) => void;
  mockRecorders: MockRecorder[];
};

// Helpers from __mocks__/expo-media-library.ts.
const mediaLibrary = mediaLibraryModule as unknown as {
  setMockGalleryPermission: (current: { granted: boolean; canAskAgain: boolean }) => void;
  mockGallery: { albums: Map<string, string[]> };
};

// Helper from __mocks__/expo-file-system.ts.
const fileSystem = fileSystemModule as unknown as { mockFiles: { existing: Set<string> } };

// Helper from __mocks__/react-native-reanimated.ts.
const reanimated = reanimatedModule as unknown as {
  mockRunFrames: (count: number, frameMs?: number) => void;
};

jest.mock('expo-router', () => ({ useIsFocused: () => true }));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderRecorder(onBusyChange?: (busy: boolean) => void) {
  return render(
    <GestureHandlerRootView>
      <SafeAreaProvider initialMetrics={METRICS}>
        <Recorder text="Test script text" onBusyChange={onBusyChange} />
      </SafeAreaProvider>
    </GestureHandlerRootView>,
  );
}

const cameraProps = () => screen.getByTestId('camera').props;
const latestRecorder = () => visionCamera.mockRecorders[visionCamera.mockRecorders.length - 1];
const pressButton = (name: string | RegExp) =>
  fireEvent.press(screen.getByRole('button', { name }));

/** Presses record and lets the 3-2-1 countdown run out. */
async function startRecording() {
  await pressButton('Start recording');
  await act(() => jest.advanceTimersByTime(3200));
}

/** Current prompter scroll offset (the text moves up as it scrolls). */
function prompterOffset() {
  const scroller = screen.getByTestId('prompter-text').parent!;
  const { transform } = StyleSheet.flatten(scroller.props.style) as {
    transform: { translateY: number }[];
  };
  return -transform[0].translateY;
}

beforeEach(() => {
  jest.useFakeTimers();
  storage.clearAll();
});

afterEach(() => {
  visionCamera.setMockDevices(['front', 'back']);
  visionCamera.mockRecorders.length = 0;
  mediaLibrary.mockGallery.albums.clear();
  mediaLibrary.setMockGalleryPermission({ granted: true, canAskAgain: true });
  jest.useRealTimers();
});

describe('preview', () => {
  it('starts on the mirrored front camera at 30 fps', async () => {
    await renderRecorder();

    expect(cameraProps().device.position).toBe('front');
    expect(cameraProps().mirrorMode).toBe('auto');
    expect(cameraProps().constraints).toEqual([{ fps: 30 }]);
    expect(cameraProps().isActive).toBe(true);
  });

  it('switches between front and back cameras', async () => {
    await renderRecorder();

    await pressButton('Switch to back camera');
    expect(cameraProps().device.position).toBe('back');

    await pressButton('Switch to front camera');
    expect(cameraProps().device.position).toBe('front');
  });

  it('hides the switch button and uses the only lens on single-camera devices', async () => {
    visionCamera.setMockDevices(['back']);
    await renderRecorder();

    expect(cameraProps().device.position).toBe('back');
    expect(screen.queryByRole('button', { name: /Switch to/ })).toBeNull();
  });

  it('explains when there is no usable camera', async () => {
    visionCamera.setMockDevices([]);
    await renderRecorder();

    expect(screen.getByText('No camera available')).toBeTruthy();
    expect(screen.queryByTestId('camera')).toBeNull();
  });
});

describe('recording', () => {
  it('records 1080p video with audio on the camera session', async () => {
    await renderRecorder();

    const [videoOutput] = cameraProps().outputs;
    expect(videoOutput.options).toEqual({
      targetResolution: { width: 1080, height: 1920 },
      enableAudio: true,
    });
  });

  it('counts down 3-2-1 before recording starts', async () => {
    const onBusyChange = jest.fn();
    await renderRecorder(onBusyChange);

    await pressButton('Start recording');
    expect(screen.getByText('3')).toBeTruthy();
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
    expect(visionCamera.mockRecorders).toHaveLength(0);

    await act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText('2')).toBeTruthy();
    await act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText('1')).toBeTruthy();
    await act(() => jest.advanceTimersByTime(1100));

    expect(visionCamera.mockRecorders).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeTruthy();
  });

  it('can cancel the countdown without recording', async () => {
    const onBusyChange = jest.fn();
    await renderRecorder(onBusyChange);

    await pressButton('Start recording');
    await pressButton('Cancel countdown');
    await act(() => jest.advanceTimersByTime(4000));

    expect(visionCamera.mockRecorders).toHaveLength(0);
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeTruthy();
  });

  it('counts elapsed time and stops', async () => {
    const onBusyChange = jest.fn();
    await renderRecorder(onBusyChange);

    await startRecording();
    // Lens switch is locked while recording.
    expect(screen.queryByRole('button', { name: /Switch to/ })).toBeNull();

    latestRecorder().recordedDuration = 65.4;
    await act(() => jest.advanceTimersByTime(300));
    expect(screen.getByText('01:05')).toBeTruthy();

    await pressButton('Stop recording');
    await act(() => latestRecorder().finishNow());

    expect(screen.getByRole('button', { name: 'Start recording' })).toBeTruthy();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });

  it('saves the finished recording to the Prompter album', async () => {
    await renderRecorder();

    await startRecording();
    const recorder = latestRecorder();
    await pressButton('Stop recording');
    await act(() => recorder.finishNow());

    expect(await screen.findByText('Saved to the "Prompter" album')).toBeTruthy();
    expect(mediaLibrary.mockGallery.albums.get('Prompter')).toEqual([
      `file://${recorder.filePath}`,
    ]);
  });

  it('offers Settings when gallery access is blocked', async () => {
    mediaLibrary.setMockGalleryPermission({ granted: false, canAskAgain: false });
    await renderRecorder();

    await startRecording();
    await pressButton('Stop recording');
    await act(() => latestRecorder().finishNow());

    expect(await screen.findByText(/allow Photos access in Settings/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open Settings' })).toBeTruthy();
  });

  it('uses a new recorder (and file) for each recording', async () => {
    await renderRecorder();

    await startRecording();
    await pressButton('Stop recording');
    await act(() => latestRecorder().finishNow());
    await startRecording();

    expect(visionCamera.mockRecorders).toHaveLength(2);
  });

  it('shows the error and allows a retry when recording fails', async () => {
    await renderRecorder();

    await startRecording();
    await act(() => latestRecorder().failNow('Camera is in use'));

    expect(screen.getByText('Recording failed: Camera is in use')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeTruthy();
  });
});

describe('prompter', () => {
  async function layoutScript() {
    const scroller = screen.getByTestId('prompter-text').parent!;
    await fireEvent(scroller, 'layout', { nativeEvent: { layout: { height: 5000 } } });
  }

  async function runFramesAndRender() {
    await act(() => reanimated.mockRunFrames(10, 100));
    // The mocked animated style is only computed on render; nudge the recorded
    // duration so the elapsed-time poll re-renders the screen.
    const recorder = latestRecorder();
    if (recorder) recorder.recordedDuration += 1;
    await act(() => jest.advanceTimersByTime(300));
  }

  it('does not scroll before or during the countdown', async () => {
    await renderRecorder();
    await layoutScript();

    await runFramesAndRender();
    await pressButton('Start recording');
    await runFramesAndRender();

    expect(prompterOffset()).toBe(0);
  });

  it('scrolls once recording starts and pauses on tap', async () => {
    await renderRecorder();
    await layoutScript();
    await startRecording();

    await runFramesAndRender();
    const scrolled = prompterOffset();
    expect(scrolled).toBeGreaterThan(0);

    await pressButton('Script');
    expect(screen.getByText('Paused · tap the text to continue')).toBeTruthy();
    await runFramesAndRender();
    expect(prompterOffset()).toBe(scrolled);

    await pressButton('Script');
    await runFramesAndRender();
    expect(prompterOffset()).toBeGreaterThan(scrolled);
  });

  it('remembers speed and text size across launches', async () => {
    const first = await renderRecorder();
    await fireEvent(
      screen.getByRole('adjustable', { name: 'Scroll speed' }),
      'accessibilityAction',
      {
        nativeEvent: { actionName: 'increment' },
      },
    );
    await fireEvent(screen.getByRole('adjustable', { name: 'Text size' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });
    expect(screen.getByText('Speed 5')).toBeTruthy();
    expect(screen.getByText('Size 34')).toBeTruthy();
    await first.unmount();

    await renderRecorder();
    expect(screen.getByText('Speed 5')).toBeTruthy();
    expect(screen.getByText('Size 34')).toBeTruthy();
  });
});

describe('interruptions', () => {
  let appStateListeners: ((state: AppStateStatus) => void)[] = [];
  const appState = AppState as { currentState: AppStateStatus };
  const initialState = appState.currentState;

  beforeEach(() => {
    appStateListeners = [];
    appState.currentState = 'active';
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
      appStateListeners.push(listener);
      return {
        remove: () => {
          appStateListeners = appStateListeners.filter((l) => l !== listener);
        },
      } as ReturnType<typeof AppState.addEventListener>;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    appState.currentState = initialState;
    fileSystem.mockFiles.existing.clear();
  });

  async function moveAppTo(state: AppStateStatus) {
    appState.currentState = state;
    await act(async () => appStateListeners.forEach((listener) => listener(state)));
  }

  it('stops the take when the app goes to the background and saves it on return', async () => {
    await renderRecorder();
    await startRecording();
    const recorder = latestRecorder();
    const stopSpy = jest.spyOn(
      recorder as unknown as { stopRecording: () => Promise<void> },
      'stopRecording',
    );

    await moveAppTo('background');
    expect(stopSpy).toHaveBeenCalledTimes(1);
    // The session stays up until the file is finalized.
    expect(cameraProps().isActive).toBe(true);

    await act(() => recorder.finishNow());
    // Nothing is written to the gallery while the app is in the background.
    expect(mediaLibrary.mockGallery.albums.get('Prompter')).toBeUndefined();
    expect(storage.getString('recorder.pendingRecording.v1')).toContain(recorder.filePath);

    await moveAppTo('active');
    expect(
      await screen.findByText('Recording was interrupted — video saved to the "Prompter" album'),
    ).toBeTruthy();
    expect(mediaLibrary.mockGallery.albums.get('Prompter')).toEqual([
      `file://${recorder.filePath}`,
    ]);
    expect(storage.getString('recorder.pendingRecording.v1')).toBeUndefined();
  });

  it('keeps recording through iOS inactive (Control Center, call banner)', async () => {
    await renderRecorder();
    await startRecording();
    const stopSpy = jest.spyOn(
      latestRecorder() as unknown as { stopRecording: () => Promise<void> },
      'stopRecording',
    );

    await moveAppTo('inactive');
    expect(stopSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeTruthy();
  });

  it('cancels a countdown when the app goes to the background', async () => {
    await renderRecorder();
    await pressButton('Start recording');
    await moveAppTo('background');
    await act(() => jest.advanceTimersByTime(4000));

    expect(visionCamera.mockRecorders).toHaveLength(0);
  });

  it('rescues the file when a call interrupts the camera and the recorder errors', async () => {
    await renderRecorder();
    await startRecording();
    const recorder = latestRecorder();
    fileSystem.mockFiles.existing.add(`file://${recorder.filePath}`);

    await act(async () =>
      cameraProps().onInterruptionStarted('audio-device-in-use-by-another-client'),
    );
    // iOS ends an interrupted movie with an error although the file is usable.
    await act(() => recorder.failNow('Session was interrupted'));

    expect(
      await screen.findByText('Recording was interrupted — video saved to the "Prompter" album'),
    ).toBeTruthy();
    expect(screen.queryByText(/Recording failed/)).toBeNull();
  });

  it('still reports a failure when nothing was written', async () => {
    await renderRecorder();
    await startRecording();
    await act(() => latestRecorder().failNow('Camera is in use'));

    expect(screen.getByText('Recording failed: Camera is in use')).toBeTruthy();
  });

  it('saves a take left over from a previous visit', async () => {
    savePendingRecording({ path: '/tmp/left-over.mp4', durationSeconds: 9 });
    fileSystem.mockFiles.existing.add('file:///tmp/left-over.mp4');

    await renderRecorder();
    await act(() => jest.advanceTimersByTime(10));

    expect(
      await screen.findByText('Recording was interrupted — video saved to the "Prompter" album'),
    ).toBeTruthy();
    expect(mediaLibrary.mockGallery.albums.get('Prompter')).toEqual(['file:///tmp/left-over.mp4']);
  });

  it('forgets a left-over take whose file is gone', async () => {
    savePendingRecording({ path: '/tmp/gone.mp4', durationSeconds: 9 });
    await renderRecorder();

    expect(storage.getString('recorder.pendingRecording.v1')).toBeUndefined();
  });
});
