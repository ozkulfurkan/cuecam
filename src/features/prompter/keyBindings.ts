/**
 * Hardware key bindings for the recorder — the one place to change them.
 *
 * Keys use the web `KeyboardEvent.code` names that expo-key-event reports on
 * both platforms ("Space", "ArrowUp", "PageDown", "KeyR" …). Keys it has no
 * name for arrive as the platform's raw key code; write those as
 * "android:<code>" or "ios:<code>" (Android KeyEvent / iOS HID usage codes),
 * because the same number means different keys on the two platforms.
 *
 * Cheap Bluetooth remotes usually send one of: PageUp/PageDown (page turners),
 * arrow keys, Space/Enter, or media keys. On iOS the volume and media keys
 * are handled by the system and never reach apps; on Android the volume keys
 * do reach the app but are left alone here so they keep changing the volume
 * (add "android:24" / "android:25" to use a camera-shutter remote that sends
 * volume up/down).
 */
export const KEY_BINDINGS = {
  /** Pause / resume the scrolling text (recording keeps running). */
  togglePause: ['Space', 'Enter', 'NumpadEnter', 'android:85' /* MEDIA_PLAY_PAUSE */],
  /** One speed step faster / slower. */
  speedUp: ['ArrowUp'],
  speedDown: ['ArrowDown'],
  /** Jump the text forward / back (page-turner remotes). */
  jumpForward: ['PageDown', 'ArrowRight', 'android:87' /* MEDIA_NEXT */],
  jumpBack: ['PageUp', 'ArrowLeft', 'android:88' /* MEDIA_PREVIOUS */],
  /** Start (with the 3-2-1 countdown) or stop the recording. */
  toggleRecording: ['KeyR', 'android:130' /* MEDIA_RECORD */],
} as const satisfies Record<string, readonly string[]>;

export type KeyAction = keyof typeof KEY_BINDINGS;

/** Actions that may fire again while a key is held down (auto-repeat). */
export const REPEATABLE_ACTIONS: readonly KeyAction[] = [
  'speedUp',
  'speedDown',
  'jumpForward',
  'jumpBack',
];

/** How far one jump moves the text, in lines. */
export const JUMP_LINES = 3;
