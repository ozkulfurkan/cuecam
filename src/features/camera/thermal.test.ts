import { toThermalState } from '../../../modules/thermal-state';

import { thermalWarning } from './thermal';

describe('thermalWarning', () => {
  it('stays quiet while the phone is cool or the state is unknown', () => {
    expect(thermalWarning('nominal')).toBe('none');
    expect(thermalWarning('fair')).toBe('none');
    expect(thermalWarning('unknown')).toBe('none');
  });

  it('warns when the OS starts throttling and when the camera may stop', () => {
    expect(thermalWarning('serious')).toBe('warm');
    expect(thermalWarning('critical')).toBe('hot');
  });
});

describe('toThermalState', () => {
  it('accepts the native values and rejects anything else', () => {
    expect(toThermalState('serious')).toBe('serious');
    expect(toThermalState('boiling')).toBe('unknown');
    expect(toThermalState(undefined)).toBe('unknown');
  });
});
