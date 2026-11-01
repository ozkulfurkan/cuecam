import { Linking } from 'react-native';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';

import {
  missingPermissions,
  permissionStep,
  requestablePermissions,
  type PermissionStatuses,
} from './permissions';

export function useRecordingPermissions() {
  const camera = useCameraPermission();
  const microphone = useMicrophonePermission();

  // VisionCamera re-reads both statuses when the app returns to the foreground,
  // so coming back from Settings updates the step without extra work here.
  const statuses: PermissionStatuses = { camera: camera.status, microphone: microphone.status };

  const request = async () => {
    // One system dialog at a time: camera first, then microphone.
    for (const permission of requestablePermissions(statuses)) {
      await (permission === 'camera' ? camera : microphone).requestPermission();
    }
  };

  return {
    step: permissionStep(statuses),
    missing: missingPermissions(statuses),
    request,
    // Opens this app's page in system Settings on both iOS and Android.
    openSettings: () => Linking.openSettings(),
  };
}
