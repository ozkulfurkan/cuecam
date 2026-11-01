import { prompterText, resolveRecorderScript } from './recorderScript';
import { createScript } from './scripts';

// Most recently edited first, as the store keeps them.
const newest = createScript('new', 300, { body: 'newest text' });
const older = createScript('old', 100, { body: 'older text' });
const scripts = [newest, older];

describe('resolveRecorderScript', () => {
  it('uses the requested script', () => {
    expect(resolveRecorderScript(scripts, 'old', 'new')).toBe(older);
  });

  it('falls back to the last used one, then the newest', () => {
    expect(resolveRecorderScript(scripts, undefined, 'old')).toBe(older);
    expect(resolveRecorderScript(scripts, undefined, undefined)).toBe(newest);
  });

  it('skips ids that no longer exist (deleted scripts)', () => {
    expect(resolveRecorderScript(scripts, 'gone', 'also-gone')).toBe(newest);
  });

  it('returns undefined without scripts', () => {
    expect(resolveRecorderScript([], 'x', 'y')).toBeUndefined();
  });
});

describe('prompterText', () => {
  it('shows the script text, or the sample when there is none', () => {
    expect(prompterText(newest, 'SAMPLE')).toBe('newest text');
    expect(prompterText(createScript('e', 1, { body: '  \n ' }), 'SAMPLE')).toBe('SAMPLE');
    expect(prompterText(undefined, 'SAMPLE')).toBe('SAMPLE');
  });
});
