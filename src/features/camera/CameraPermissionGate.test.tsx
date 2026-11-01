import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking, Text } from 'react-native';
import * as visionCameraModule from 'react-native-vision-camera';

import { CameraPermissionGate } from './CameraPermissionGate';

type Status = 'not-determined' | 'authorized' | 'denied' | 'restricted';
type Statuses = { camera?: Status; microphone?: Status };

// Helpers from __mocks__/react-native-vision-camera.ts, imported the same way
// the component imports the package so both share one mock instance.
const visionCamera = visionCameraModule as unknown as {
  setMockPermissions: (statuses: Statuses, requestResults?: Statuses) => void;
  requestCalls: string[];
};

function renderGate(statuses: Statuses, requestResults?: Statuses) {
  visionCamera.setMockPermissions(statuses, requestResults);
  return render(
    <CameraPermissionGate>
      <Text>Camera ready</Text>
    </CameraPermissionGate>,
  );
}

beforeEach(() => {
  visionCamera.requestCalls.length = 0;
});

it('shows the recorder once both permissions are granted', async () => {
  await renderGate({ camera: 'authorized', microphone: 'authorized' });
  expect(screen.getByText('Camera ready')).toBeTruthy();
});

it('asks for camera, then microphone, and then shows the recorder', async () => {
  await renderGate({ camera: 'not-determined', microphone: 'not-determined' });
  expect(screen.queryByText('Camera ready')).toBeNull();

  await fireEvent.press(screen.getByRole('button', { name: 'Allow access' }));

  expect(visionCamera.requestCalls).toEqual(['camera', 'microphone']);
  expect(screen.getByText('Camera ready')).toBeTruthy();
});

it('switches to Settings guidance when the user denies the dialog', async () => {
  await renderGate(
    { camera: 'not-determined', microphone: 'not-determined' },
    { microphone: 'denied' },
  );

  await fireEvent.press(screen.getByRole('button', { name: 'Allow access' }));

  expect(screen.getByText('Microphone access is off')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Open Settings' })).toBeTruthy();
});

it('opens system Settings for a denied permission', async () => {
  const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  await renderGate({ camera: 'denied', microphone: 'authorized' });

  expect(screen.getByText('Camera access is off')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Open Settings' }));

  expect(openSettings).toHaveBeenCalledTimes(1);
  expect(visionCamera.requestCalls).toEqual([]);
});

it('explains a device restriction without offering an action', async () => {
  await renderGate({ camera: 'restricted', microphone: 'authorized' });

  expect(screen.getByText('Camera is restricted')).toBeTruthy();
  expect(screen.queryByRole('button')).toBeNull();
});
