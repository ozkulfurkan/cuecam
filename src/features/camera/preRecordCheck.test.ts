import { translate } from '@/i18n/translate';

import { preRecordMessage, preRecordWarnings } from './preRecordCheck';
import { BYTES_PER_MINUTE, STORAGE_RESERVE_BYTES } from './storageSpace';

const en = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
  translate('en', key, params);

const freeFor = (minutes: number) =>
  STORAGE_RESERVE_BYTES + 2 * minutes * BYTES_PER_MINUTE['1080p'];

describe('preRecordWarnings', () => {
  it('has nothing to say on a cool phone with space', () => {
    expect(
      preRecordWarnings({ availableBytes: freeFor(60), quality: '1080p', thermal: 'nominal' }),
    ).toEqual([]);
  });

  it('reports low and critical storage with the minutes that fit', () => {
    expect(
      preRecordWarnings({ availableBytes: freeFor(5), quality: '1080p', thermal: 'unknown' }),
    ).toEqual([{ kind: 'storage', level: 'low', minutes: 5 }]);
    expect(
      preRecordWarnings({ availableBytes: freeFor(1), quality: '1080p', thermal: 'unknown' }),
    ).toEqual([{ kind: 'storage', level: 'critical', minutes: 1 }]);
  });

  it('does not guess when free space is unknown', () => {
    expect(
      preRecordWarnings({ availableBytes: undefined, quality: '4k', thermal: 'nominal' }),
    ).toEqual([]);
  });

  it('only interrupts for heat once the phone is critical', () => {
    expect(
      preRecordWarnings({ availableBytes: freeFor(60), quality: '1080p', thermal: 'serious' }),
    ).toEqual([]);
    expect(
      preRecordWarnings({ availableBytes: freeFor(60), quality: '1080p', thermal: 'critical' }),
    ).toEqual([{ kind: 'thermal' }]);
  });
});

describe('preRecordMessage', () => {
  it('joins one paragraph per warning', () => {
    const message = preRecordMessage(
      [{ kind: 'storage', level: 'low', minutes: 4 }, { kind: 'thermal' }],
      '1080p',
      en,
    );
    expect(message).toBe(
      'Storage is running low: about 4 min of 1080p video fits.\n\n' +
        'The phone is very hot. The camera may stop or drop frames; let it cool down if you can.',
    );
  });
});
