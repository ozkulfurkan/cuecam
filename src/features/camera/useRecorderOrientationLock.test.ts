import { renderHook, waitFor } from '@testing-library/react-native';
import * as screenOrientationModule from 'expo-screen-orientation';
import { Orientation, OrientationLock } from 'expo-screen-orientation';

import { useRecorderOrientationLock } from './useRecorderOrientationLock';

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

// Helpers from __mocks__/expo-screen-orientation.ts.
const screenOrientation = screenOrientationModule as unknown as {
  mockLocks: number[];
  setMockOrientation: (orientation: Orientation) => void;
};

beforeEach(() => {
  screenOrientation.mockLocks.length = 0;
  screenOrientation.setMockOrientation(Orientation.PORTRAIT_UP);
});

it('follows the phone while open, freezes for a recording, and restores portrait on close', async () => {
  const { rerender, unmount } = await renderHook(
    ({ busy }: { busy: boolean }) => useRecorderOrientationLock(busy),
    { initialProps: { busy: false } },
  );
  expect(screenOrientation.mockLocks).toContain(OrientationLock.DEFAULT);

  // The user turns the phone and presses record.
  screenOrientation.setMockOrientation(Orientation.LANDSCAPE_RIGHT);
  screenOrientation.mockLocks.length = 0;
  await rerender({ busy: true });
  await waitFor(() =>
    expect(screenOrientation.mockLocks).toEqual([OrientationLock.LANDSCAPE_RIGHT]),
  );

  // Recording ends: rotation is free again.
  await rerender({ busy: false });
  expect(screenOrientation.mockLocks.at(-1)).toBe(OrientationLock.DEFAULT);

  // Closing the recorder puts the app back in portrait.
  await unmount();
  expect(screenOrientation.mockLocks.at(-1)).toBe(OrientationLock.PORTRAIT_UP);
});
