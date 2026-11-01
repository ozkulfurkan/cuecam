import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

type Listener = (event: { key: string; repeat?: boolean }) => void;
type Options = { preventReload?: boolean; captureModifiers?: boolean };

const mockKeyEvent: { listener?: Listener; options?: Options } = {};

jest.mock('expo', () => ({
  // Pretend the dev build has expo-key-event's native module.
  requireOptionalNativeModule: (name: string) => (name === 'ExpoKeyEvent' ? {} : null),
}));
jest.mock('expo-key-event', () => ({
  useKeyEventListener: (listener: Listener, options: Options) => {
    mockKeyEvent.listener = listener;
    mockKeyEvent.options = options;
  },
}));

// Imported after the mocks so the module sees the "native" key module.
// eslint-disable-next-line import/first
import { useHardwareKeys } from './useHardwareKeys';

it('turns key presses into actions', async () => {
  const onAction = jest.fn();
  await renderHook(() => useHardwareKeys(onAction));

  mockKeyEvent.listener!({ key: 'Space' });
  mockKeyEvent.listener!({ key: 'ArrowUp', repeat: true });
  mockKeyEvent.listener!({ key: 'Space', repeat: true });
  mockKeyEvent.listener!({ key: 'KeyQ' });

  expect(onAction.mock.calls).toEqual([['togglePause'], ['speedUp']]);
});

it('qualifies raw codes with the current platform', async () => {
  const onAction = jest.fn();
  await renderHook(() => useHardwareKeys(onAction));

  // 85 is MEDIA_PLAY_PAUSE on Android only; on iOS it is an unbound key.
  mockKeyEvent.listener!({ key: '85' });
  if (Platform.OS === 'android') {
    expect(onAction).toHaveBeenCalledWith('togglePause');
  } else {
    expect(onAction).not.toHaveBeenCalled();
  }
});

it('keeps "R" from reloading the app in development and reads held keys', async () => {
  await renderHook(() => useHardwareKeys(jest.fn()));
  expect(mockKeyEvent.options).toMatchObject({ preventReload: true, captureModifiers: true });
});

it('always calls the latest handler', async () => {
  const first = jest.fn();
  const second = jest.fn();
  const hook = await renderHook(({ handler }: { handler: jest.Mock }) => useHardwareKeys(handler), {
    initialProps: { handler: first },
  });
  await hook.rerender({ handler: second });

  mockKeyEvent.listener!({ key: 'KeyR' });
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledWith('toggleRecording');
});
