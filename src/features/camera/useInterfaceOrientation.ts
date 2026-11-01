import {
  addOrientationChangeListener,
  getOrientationAsync,
  Orientation,
} from 'expo-screen-orientation';
import { useEffect, useState } from 'react';

/** The current interface orientation, updated as the screen rotates. */
export function useInterfaceOrientation(): Orientation {
  const [orientation, setOrientation] = useState(Orientation.PORTRAIT_UP);

  useEffect(() => {
    let mounted = true;
    getOrientationAsync().then((value) => {
      if (mounted) setOrientation(value);
    });
    const subscription = addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return orientation;
}
