import { requireOptionalNativeModule } from 'expo';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import type { KeyAction } from './keyBindings';
import { actionForKey } from './keymap';

type KeyPressEvent = { key: string; repeat?: boolean };
type UseKeyEventListener = (
  listener: (event: KeyPressEvent) => void,
  options: { listenOnMount?: boolean; preventReload?: boolean; captureModifiers?: boolean },
) => unknown;

// expo-key-event looks up its native module as soon as it is imported and
// throws if it is missing (Expo Go, Jest, or a dev build made before the
// package was added). Load it only when the native side exists, so an older
// build simply has no keyboard support instead of crashing the recorder.
const useKeyEventListener: UseKeyEventListener =
  requireOptionalNativeModule('ExpoKeyEvent') != null
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('expo-key-event') as { useKeyEventListener: UseKeyEventListener })
        .useKeyEventListener
    : () => undefined;

/**
 * Calls `onAction` for bound hardware keys (Bluetooth keyboards and remotes)
 * while the calling screen is mounted. See keyBindings.ts for the keys.
 *
 * Platform: on Android the library adds a focusable view to the activity to
 * receive key events; on iOS a hidden first-responder view. Both only work
 * while the app is in the foreground.
 */
export function useHardwareKeys(onAction: (action: KeyAction) => void) {
  // The listener stays the same function for the screen's lifetime, so the
  // native subscription is not torn down and recreated on every render.
  const onActionRef = useRef(onAction);
  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);
  const listener = useCallback((event: KeyPressEvent) => {
    const action = actionForKey({ key: event.key, platform: Platform.OS, repeat: event.repeat });
    if (action) onActionRef.current(action);
  }, []);

  useKeyEventListener(listener, {
    listenOnMount: true,
    // The library reloads the JS bundle on "R" in development; "R" records here.
    preventReload: true,
    // Needed for the `repeat` flag (held keys).
    captureModifiers: true,
  });
}
