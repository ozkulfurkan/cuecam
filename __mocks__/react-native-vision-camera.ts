// Used automatically by Jest for 'react-native-vision-camera' (its Nitro native
// modules do not exist under Jest). Tests set statuses with setMockPermissions.
import { useState } from 'react';

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
