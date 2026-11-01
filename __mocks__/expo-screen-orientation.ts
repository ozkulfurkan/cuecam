// Used automatically by Jest for 'expo-screen-orientation'. Keeps the real
// enums; the native calls record what was requested. Tests change the reported
// orientation with setMockOrientation.
import { Orientation } from 'expo-screen-orientation/build/ScreenOrientation.types';

export {
  Orientation,
  OrientationLock,
} from 'expo-screen-orientation/build/ScreenOrientation.types';

let current: Orientation = Orientation.PORTRAIT_UP;
type Listener = (event: { orientationInfo: { orientation: Orientation } }) => void;
const listeners = new Set<Listener>();

/** Every lock requested, in order. */
export const mockLocks: number[] = [];

export function setMockOrientation(orientation: Orientation) {
  current = orientation;
  listeners.forEach((listener) => listener({ orientationInfo: { orientation } }));
}

export async function lockAsync(lock: number) {
  mockLocks.push(lock);
}

export async function getOrientationAsync() {
  return current;
}

export function addOrientationChangeListener(listener: Listener) {
  listeners.add(listener);
  return { remove: () => listeners.delete(listener) };
}
