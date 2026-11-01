// JS side of the local ThermalState Expo module (ios/ and android/ next to
// this file). The native module only exists in a development/production
// build made after it was added; everywhere else (Expo Go, Jest, web, an old
// build) the functions report 'unknown' and never call listeners.
import { NativeModule, requireOptionalNativeModule } from 'expo';

/** iOS ProcessInfo.ThermalState; Android's PowerManager levels are folded into it. */
export type ThermalState = 'nominal' | 'fair' | 'serious' | 'critical' | 'unknown';

type ThermalStateEvents = {
  onThermalStateChange: (event: { state: string }) => void;
};

declare class ThermalStateNativeModule extends NativeModule<ThermalStateEvents> {
  getThermalState(): string;
}

const STATES: readonly ThermalState[] = ['nominal', 'fair', 'serious', 'critical', 'unknown'];

const native = requireOptionalNativeModule<ThermalStateNativeModule>('ThermalState');

export function toThermalState(value: unknown): ThermalState {
  return STATES.includes(value as ThermalState) ? (value as ThermalState) : 'unknown';
}

export function getThermalState(): ThermalState {
  try {
    return toThermalState(native?.getThermalState());
  } catch {
    return 'unknown';
  }
}

export function addThermalStateListener(listener: (state: ThermalState) => void): {
  remove: () => void;
} {
  if (!native) return { remove: () => {} };
  const subscription = native.addListener('onThermalStateChange', (event: { state: string }) =>
    listener(toThermalState(event?.state)),
  );
  return { remove: () => subscription.remove() };
}
