// Used automatically by Jest for 'react-native-vision-camera' (its Nitro native
// modules do not exist under Jest). Tests set statuses with setMockPermissions
// and available lenses with setMockDevices.
import { createElement, useState } from 'react';
import { View } from 'react-native';

type PermissionStatus = 'not-determined' | 'authorized' | 'denied' | 'restricted';

const mockStatuses: { camera: PermissionStatus; microphone: PermissionStatus } = {
  camera: 'not-determined',
  microphone: 'not-determined',
};

// What the next request resolves to, per permission.
const mockRequestResults: typeof mockStatuses = { camera: 'authorized', microphone: 'authorized' };

export function setMockPermissions(
  statuses: Partial<typeof mockStatuses>,
  requestResults: Partial<typeof mockStatuses> = {},
) {
  Object.assign(mockStatuses, statuses);
  Object.assign(
    mockRequestResults,
    { camera: 'authorized', microphone: 'authorized' },
    requestResults,
  );
}

export const requestCalls: (keyof typeof mockStatuses)[] = [];

function makeHook(kind: keyof typeof mockStatuses) {
  return () => {
    const [status, setStatus] = useState<PermissionStatus>(mockStatuses[kind]);
    return {
      status,
      hasPermission: status === 'authorized',
      canRequestPermission: status === 'not-determined',
      requestPermission: async () => {
        requestCalls.push(kind);
        mockStatuses[kind] = mockRequestResults[kind];
        setStatus(mockStatuses[kind]);
        return mockStatuses[kind] === 'authorized';
      },
    };
  };
}

export const useCameraPermission = makeHook('camera');
export const useMicrophonePermission = makeHook('microphone');

type Position = 'front' | 'back' | 'external';

let mockDevices: { id: string; position: Position }[] = [];

export function setMockDevices(positions: Position[]) {
  mockDevices = positions.map((position) => ({ id: `mock-${position}`, position }));
}
setMockDevices(['front', 'back']);

export const useCameraDevices = () => mockDevices;
export const useCameraDevice = (position: Position) =>
  mockDevices.find((device) => device.position === position);

/** Renders a plain View; tests read the props it was given via testID "camera". */
export function Camera(props: Record<string, unknown>) {
  return createElement(View, { testID: 'camera', ...props });
}
