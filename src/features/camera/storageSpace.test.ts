import {
  BYTES_PER_MINUTE,
  maxFileSizeFor,
  recordableBytes,
  recordableMinutes,
  STORAGE_RESERVE_BYTES,
  storageLevel,
} from './storageSpace';

const MB = 1024 * 1024;
const GB = 1024 * MB;

describe('recordableBytes', () => {
  it('keeps the reserve and room for the gallery copy', () => {
    expect(recordableBytes(STORAGE_RESERVE_BYTES + 200 * MB)).toBe(100 * MB);
  });

  it('is never negative', () => {
    expect(recordableBytes(0)).toBe(0);
    expect(recordableBytes(STORAGE_RESERVE_BYTES - 1)).toBe(0);
  });
});

describe('recordableMinutes', () => {
  it('grows with free space and shrinks with quality', () => {
    const free = STORAGE_RESERVE_BYTES + 2 * 10 * BYTES_PER_MINUTE['1080p'];
    expect(recordableMinutes(free, '1080p')).toBe(10);
    expect(recordableMinutes(free, '720p')).toBeGreaterThan(10);
    expect(recordableMinutes(free, '4k')).toBe(3);
  });
});

describe('storageLevel', () => {
  const freeFor = (minutes: number) =>
    STORAGE_RESERVE_BYTES + 2 * minutes * BYTES_PER_MINUTE['1080p'];

  it('is ok with plenty of space or when free space is unknown', () => {
    expect(storageLevel(64 * GB, '1080p')).toBe('ok');
    expect(storageLevel(freeFor(10), '1080p')).toBe('ok');
    expect(storageLevel(undefined, '4k')).toBe('ok');
  });

  it('warns below 10 minutes and strongly below 2', () => {
    expect(storageLevel(freeFor(9), '1080p')).toBe('low');
    expect(storageLevel(freeFor(2), '1080p')).toBe('low');
    expect(storageLevel(freeFor(1), '1080p')).toBe('critical');
    expect(storageLevel(0, '720p')).toBe('critical');
  });

  it('depends on the chosen quality', () => {
    const free = freeFor(12);
    expect(storageLevel(free, '1080p')).toBe('ok');
    expect(storageLevel(free, '4k')).toBe('low');
  });
});

describe('maxFileSizeFor', () => {
  it('caps the take at the recordable space', () => {
    expect(maxFileSizeFor(STORAGE_RESERVE_BYTES + 2 * GB)).toBe(GB);
  });

  it('never sets a uselessly small cap, and none when space is unknown', () => {
    expect(maxFileSizeFor(0)).toBe(10 * MB);
    expect(maxFileSizeFor(undefined)).toBeUndefined();
  });
});
