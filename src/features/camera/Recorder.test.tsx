import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as mediaLibraryModule from 'expo-media-library';
import * as visionCameraModule from 'react-native-vision-camera';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

jest.mock('expo-router', () => ({ useIsFocused: () => true }));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderRecorder(onBusyChange?: (busy: boolean) => void) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <Recorder onBusyChange={onBusyChange} />
    </SafeAreaProvider>,
  );
}

const cameraProps = () => screen.getByTestId('camera').props;
const latestRecorder = () => visionCamera.mockRecorders[visionCamera.mockRecorders.length - 1];
const pressButton = (name: string | RegExp) =>
  fireEvent.press(screen.getByRole('button', { name }));

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

  it('starts, counts elapsed time, and stops', async () => {
    jest.useFakeTimers();
    const onBusyChange = jest.fn();
    await renderRecorder(onBusyChange);

    await pressButton('Start recording');
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeTruthy();
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
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

    await pressButton('Start recording');
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

    await pressButton('Start recording');
    await pressButton('Stop recording');
    await act(() => latestRecorder().finishNow());

    expect(await screen.findByText(/allow Photos access in Settings/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open Settings' })).toBeTruthy();
  });

  it('uses a new recorder (and file) for each recording', async () => {
    await renderRecorder();

    await pressButton('Start recording');
    await pressButton('Stop recording');
    await act(() => latestRecorder().finishNow());
    await pressButton('Start recording');

    expect(visionCamera.mockRecorders).toHaveLength(2);
  });

  it('shows the error and allows a retry when recording fails', async () => {
    await renderRecorder();

    await pressButton('Start recording');
    await act(() => latestRecorder().failNow('Camera is in use'));

    expect(screen.getByText('Recording failed: Camera is in use')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeTruthy();
  });
});
