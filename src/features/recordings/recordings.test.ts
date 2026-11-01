import {
  creationTimeMs,
  durationSeconds,
  formatRecordingDate,
  sortRecordings,
  type Recording,
} from './recordings';

const rec = (id: string, createdAt: number): Recording => ({
  id,
  uri: `file:///${id}.mp4`,
  durationSeconds: 10,
  createdAt,
});

it('sorts newest first, undated last', () => {
  expect(sortRecordings([rec('a', 100), rec('b', 0), rec('c', 300)]).map((r) => r.id)).toEqual([
    'c',
    'a',
    'b',
  ]);
});

describe('media library values (milliseconds on both platforms)', () => {
  it('converts duration to seconds', () => {
    expect(durationSeconds(10_335)).toBeCloseTo(10.335);
    expect(durationSeconds(4_745)).toBeCloseTo(4.745);
  });

  it('keeps creation time in milliseconds', () => {
    expect(creationTimeMs(1_793_571_098_000)).toBe(1_793_571_098_000);
  });

  it('treats missing or invalid values as unknown', () => {
    expect(durationSeconds(null)).toBe(0);
    expect(durationSeconds(-1)).toBe(0);
    expect(creationTimeMs(undefined)).toBe(0);
  });
});

describe('formatRecordingDate', () => {
  const date = Date.UTC(2026, 10, 2, 11, 5);

  it('formats in the app language', () => {
    expect(formatRecordingDate(date, 'en')).toMatch(/Nov/);
    expect(formatRecordingDate(date, 'tr')).toMatch(/Kas/);
  });

  it('is empty when the date is unknown', () => {
    expect(formatRecordingDate(0, 'en')).toBe('');
  });
});
