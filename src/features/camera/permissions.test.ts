import {
  describePermissions,
  missingPermissions,
  permissionStep,
  requestablePermissions,
  type PermissionStatuses,
} from './permissions';

const both = (
  camera: PermissionStatuses['camera'],
  microphone: PermissionStatuses['microphone'],
): PermissionStatuses => ({ camera, microphone });

describe('permissionStep', () => {
  it('is ready only when both are authorized', () => {
    expect(permissionStep(both('authorized', 'authorized'))).toBe('ready');
    expect(permissionStep(both('authorized', 'not-determined'))).not.toBe('ready');
  });

  it('asks when something can still be requested', () => {
    expect(permissionStep(both('not-determined', 'not-determined'))).toBe('request');
    expect(permissionStep(both('authorized', 'not-determined'))).toBe('request');
  });

  it('sends the user to Settings once a permission is denied', () => {
    expect(permissionStep(both('denied', 'authorized'))).toBe('open-settings');
    // A denial wins over a permission that could still be asked for: asking for
    // the microphone alone would not let the user record.
    expect(permissionStep(both('denied', 'not-determined'))).toBe('open-settings');
  });

  it('reports a device restriction above everything else', () => {
    expect(permissionStep(both('restricted', 'denied'))).toBe('restricted');
    expect(permissionStep(both('authorized', 'restricted'))).toBe('restricted');
  });
});

describe('missingPermissions', () => {
  it('lists what is not authorized, camera first', () => {
    expect(missingPermissions(both('denied', 'not-determined'))).toEqual(['camera', 'microphone']);
    expect(missingPermissions(both('authorized', 'denied'))).toEqual(['microphone']);
    expect(missingPermissions(both('authorized', 'authorized'))).toEqual([]);
  });
});

describe('requestablePermissions', () => {
  it('includes only not-determined permissions', () => {
    expect(requestablePermissions(both('not-determined', 'not-determined'))).toEqual([
      'camera',
      'microphone',
    ]);
    expect(requestablePermissions(both('denied', 'not-determined'))).toEqual(['microphone']);
    expect(requestablePermissions(both('authorized', 'restricted'))).toEqual([]);
  });
});

describe('describePermissions', () => {
  it('joins labels for user-facing text', () => {
    expect(describePermissions(['camera'])).toBe('Camera');
    expect(describePermissions(['microphone'])).toBe('Microphone');
    expect(describePermissions(['camera', 'microphone'])).toBe('Camera and Microphone');
  });
});
