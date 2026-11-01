import { Orientation, OrientationLock } from 'expo-screen-orientation';

import {
  APP_LOCK,
  cameraSideFor,
  isLandscape,
  lockForRecording,
  RECORDER_FREE_LOCK,
} from './orientation';

describe('cameraSideFor', () => {
  it('puts the camera at the top in portrait', () => {
    expect(cameraSideFor(Orientation.PORTRAIT_UP)).toBe('top');
    expect(cameraSideFor(Orientation.UNKNOWN)).toBe('top');
  });

  it('puts the camera on the left when the phone is turned counter-clockwise', () => {
    expect(cameraSideFor(Orientation.LANDSCAPE_RIGHT)).toBe('left');
  });

  it('puts the camera on the right when the phone is turned clockwise', () => {
    expect(cameraSideFor(Orientation.LANDSCAPE_LEFT)).toBe('right');
  });
});

describe('isLandscape', () => {
  it('is true only for the two landscape orientations', () => {
    expect(isLandscape(Orientation.LANDSCAPE_LEFT)).toBe(true);
    expect(isLandscape(Orientation.LANDSCAPE_RIGHT)).toBe(true);
    expect(isLandscape(Orientation.PORTRAIT_UP)).toBe(false);
  });
});

describe('lockForRecording', () => {
  it('freezes the current orientation', () => {
    expect(lockForRecording(Orientation.PORTRAIT_UP)).toBe(OrientationLock.PORTRAIT_UP);
    expect(lockForRecording(Orientation.LANDSCAPE_LEFT)).toBe(OrientationLock.LANDSCAPE_LEFT);
    expect(lockForRecording(Orientation.LANDSCAPE_RIGHT)).toBe(OrientationLock.LANDSCAPE_RIGHT);
  });

  it('falls back to portrait for unknown or upside-down', () => {
    expect(lockForRecording(Orientation.UNKNOWN)).toBe(OrientationLock.PORTRAIT_UP);
    expect(lockForRecording(Orientation.PORTRAIT_DOWN)).toBe(OrientationLock.PORTRAIT_UP);
  });
});

it('keeps the app portrait and lets only the recorder rotate', () => {
  expect(APP_LOCK).toBe(OrientationLock.PORTRAIT_UP);
  expect(RECORDER_FREE_LOCK).toBe(OrientationLock.DEFAULT);
});
