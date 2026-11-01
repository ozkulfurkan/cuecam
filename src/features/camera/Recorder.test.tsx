import { fireEvent, render, screen } from '@testing-library/react-native';
import * as visionCameraModule from 'react-native-vision-camera';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Recorder } from './Recorder';

// Helpers from __mocks__/react-native-vision-camera.ts (same import path as the
// component, so both share one mock instance).
const visionCamera = visionCameraModule as unknown as {
  setMockDevices: (positions: ('front' | 'back' | 'external')[]) => void;
};

jest.mock('expo-router', () => ({ useIsFocused: () => true }));

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderRecorder() {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <Recorder />
    </SafeAreaProvider>,
  );
}

const cameraProps = () => screen.getByTestId('camera').props;

afterEach(() => visionCamera.setMockDevices(['front', 'back']));

it('starts on the mirrored front camera at 30 fps', async () => {
  await renderRecorder();

  expect(cameraProps().device.position).toBe('front');
  expect(cameraProps().mirrorMode).toBe('auto');
  expect(cameraProps().constraints).toEqual([{ fps: 30 }]);
  expect(cameraProps().isActive).toBe(true);
});

it('switches between front and back cameras', async () => {
  await renderRecorder();

  await fireEvent.press(screen.getByRole('button', { name: 'Switch to back camera' }));
  expect(cameraProps().device.position).toBe('back');

  await fireEvent.press(screen.getByRole('button', { name: 'Switch to front camera' }));
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
