import { KEY_BINDINGS, REPEATABLE_ACTIONS, type KeyAction } from './keyBindings';

type Bindings = Record<KeyAction, readonly string[]>;

/**
 * expo-key-event reports named keys ("Space") as-is and keys without a name
 * as a bare platform key code ("24"); the code is qualified with the platform
 * so bindings can't mix up Android and iOS numbers.
 */
export function normalizeKey(key: string, platform: string): string {
  return /^\d+$/.test(key) ? `${platform}:${key}` : key;
}

/** Key → action lookup built from the bindings. */
export function buildKeymap(bindings: Bindings = KEY_BINDINGS): Map<string, KeyAction> {
  const map = new Map<string, KeyAction>();
  for (const action of Object.keys(bindings) as KeyAction[]) {
    for (const key of bindings[action]) map.set(key, action);
  }
  return map;
}

/** Keys bound to more than one action (a configuration mistake). */
export function conflictingKeys(bindings: Bindings = KEY_BINDINGS): string[] {
  const seen = new Map<string, number>();
  for (const keys of Object.values(bindings)) {
    for (const key of keys) seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return [...seen].filter(([, count]) => count > 1).map(([key]) => key);
}

const DEFAULT_KEYMAP = buildKeymap();

type KeyPress = {
  key: string;
  platform: string;
  /** True for auto-repeat events while the key is held. */
  repeat?: boolean;
};

/**
 * The action for a key press, if any. Held keys repeat speed and jump
 * actions but never toggles (holding Space must not flicker pause on/off).
 */
export function actionForKey(
  { key, platform, repeat = false }: KeyPress,
  keymap: Map<string, KeyAction> = DEFAULT_KEYMAP,
): KeyAction | undefined {
  const action = keymap.get(normalizeKey(key, platform));
  if (action === undefined) return undefined;
  if (repeat && !REPEATABLE_ACTIONS.includes(action)) return undefined;
  return action;
}
