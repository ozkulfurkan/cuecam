import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

// Only a real backgrounding stops the camera. `currentState` can be unknown
// (null) right at launch, and iOS reports 'inactive' for brief overlays such as
// Control Center, where the preview should keep running.
const isForegroundState = (state: AppStateStatus | string | null | undefined) =>
  state !== 'background';

/**
 * The camera should only run while its screen is visible and the app is in the
 * foreground: it frees the sensor for other apps, saves battery, and on Android
 * avoids the session being torn down underneath us when the app is backgrounded.
 */
export function useIsCameraActive(): boolean {
  const isFocused = useIsFocused();
  const [isForeground, setIsForeground] = useState(() => isForegroundState(AppState.currentState));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setIsForeground(isForegroundState(state));
    });
    return () => subscription.remove();
  }, []);

  return isFocused && isForeground;
}
