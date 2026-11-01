import type { ThermalState } from '../../../modules/thermal-state';

export type { ThermalState };

/**
 * - `warm`: iOS "serious" / Android MODERATE — the OS starts throttling, frame
 *   drops become likely in long takes.
 * - `hot`: iOS "critical" / Android SEVERE and above — the camera may be shut
 *   down by the OS any moment.
 */
export type ThermalWarning = 'none' | 'warm' | 'hot';

export function thermalWarning(state: ThermalState): ThermalWarning {
  switch (state) {
    case 'serious':
      return 'warm';
    case 'critical':
      return 'hot';
    default:
      return 'none';
  }
}
