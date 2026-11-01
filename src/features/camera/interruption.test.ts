import {
  causeFromAppState,
  causeFromCameraInterruption,
  shouldRescueAfterError,
} from './interruption';

describe('causeFromAppState', () => {
  it('interrupts only when the app goes to the background', () => {
    expect(causeFromAppState('background')).toBe('app-background');
  });

  it('ignores iOS inactive (Control Center, call banner) and returning to active', () => {
    expect(causeFromAppState('inactive')).toBeUndefined();
    expect(causeFromAppState('active')).toBeUndefined();
    expect(causeFromAppState(null)).toBeUndefined();
  });
});

describe('causeFromCameraInterruption', () => {
  it('maps iOS reasons', () => {
    expect(causeFromCameraInterruption('audio-device-in-use-by-another-client')).toBe(
      'audio-in-use',
    );
    expect(causeFromCameraInterruption('video-device-not-available-due-to-system-pressure')).toBe(
      'system-pressure',
    );
    expect(causeFromCameraInterruption('video-device-not-available-in-background')).toBe(
      'app-background',
    );
    expect(causeFromCameraInterruption('video-device-in-use-by-another-client')).toBe(
      'camera-unavailable',
    );
  });

  it("treats Android's 'unknown' as the camera being taken away", () => {
    expect(causeFromCameraInterruption('unknown')).toBe('camera-unavailable');
  });
});

describe('shouldRescueAfterError', () => {
  it('keeps the file of a take that had started', () => {
    expect(shouldRescueAfterError(true, true)).toBe(true);
  });

  it('gives up when the take never started or nothing was written', () => {
    expect(shouldRescueAfterError(false, true)).toBe(false);
    expect(shouldRescueAfterError(true, false)).toBe(false);
  });
});
