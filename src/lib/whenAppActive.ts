import { AppState } from 'react-native';

/**
 * Resolves once the app is back from the background (immediately if it is not
 * in the background). iOS 'inactive' (Control Center, call banner) still
 * counts as foreground, and so does an unknown state right at launch.
 * Work that needs the foreground — e.g. writing to the photo library right
 * after a take was cut short by the app going to the background — waits here.
 */
export function whenAppActive(): Promise<void> {
  if (AppState.currentState !== 'background') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      subscription.remove();
      resolve();
    });
  });
}
