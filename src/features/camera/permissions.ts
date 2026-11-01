import type { PermissionStatus } from 'react-native-vision-camera';

export type RecordingPermission = 'camera' | 'microphone';

export type PermissionStatuses = Record<RecordingPermission, PermissionStatus>;

/**
 * What the recorder should show for the current permission state:
 * - `ready`: both granted, recording can start.
 * - `request`: at least one can still be asked for with the system dialog.
 * - `open-settings`: one was denied and the OS will not ask again; only the
 *   Settings app can grant it.
 * - `restricted`: blocked by the device (parental controls, MDM); the user
 *   cannot change it from the app.
 *
 * Statuses mean the same on both platforms (VisionCamera normalises them):
 * Android reports a first, recoverable denial as `not-determined`, and only a
 * "don't ask again" denial as `denied`.
 */
export type PermissionStep = 'ready' | 'request' | 'open-settings' | 'restricted';

const ORDER: readonly RecordingPermission[] = ['camera', 'microphone'];

export function missingPermissions(statuses: PermissionStatuses): RecordingPermission[] {
  return ORDER.filter((permission) => statuses[permission] !== 'authorized');
}

export function permissionStep(statuses: PermissionStatuses): PermissionStep {
  const missing = missingPermissions(statuses).map((permission) => statuses[permission]);
  if (missing.length === 0) return 'ready';
  // Worst case wins: a restriction cannot be fixed at all, a denial only in Settings.
  if (missing.includes('restricted')) return 'restricted';
  if (missing.includes('denied')) return 'open-settings';
  return 'request';
}

/** Permissions the system dialog may still be shown for, in request order. */
export function requestablePermissions(statuses: PermissionStatuses): RecordingPermission[] {
  return ORDER.filter((permission) => statuses[permission] === 'not-determined');
}

const LABELS: Record<RecordingPermission, string> = {
  camera: 'Camera',
  microphone: 'Microphone',
};

/** "Camera", "Microphone" or "Camera and Microphone", for user-facing copy. */
export function describePermissions(permissions: readonly RecordingPermission[]): string {
  return permissions.map((permission) => LABELS[permission]).join(' and ');
}
