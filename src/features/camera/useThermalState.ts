import { useEffect, useState } from 'react';

import {
  addThermalStateListener,
  getThermalState,
  type ThermalState,
} from '../../../modules/thermal-state';

/**
 * The phone's thermal state, kept current while the screen is mounted. Reads
 * 'unknown' on builds without the native module and on Android < 10.
 */
export function useThermalState(): ThermalState {
  const [state, setState] = useState<ThermalState>(getThermalState);

  useEffect(() => {
    const subscription = addThermalStateListener(setState);
    return () => subscription.remove();
  }, []);

  return state;
}
