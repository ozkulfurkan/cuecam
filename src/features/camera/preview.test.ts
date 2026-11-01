import {
  canSwitchPosition,
  DEFAULT_POSITION,
  otherPosition,
  PREVIEW_FPS,
  previewConstraints,
  resolvePosition,
} from './preview';

it('starts on the front camera at 30 fps', () => {
  expect(DEFAULT_POSITION).toBe('front');
  expect(PREVIEW_FPS).toBe(30);
  expect(previewConstraints).toEqual([{ fps: 30 }]);
});

it('flips between front and back', () => {
  expect(otherPosition('front')).toBe('back');
  expect(otherPosition('back')).toBe('front');
});

describe('resolvePosition', () => {
  it('uses the requested lens when it exists', () => {
    expect(resolvePosition('back', ['front', 'back'])).toBe('back');
  });

  it('falls back to the other lens', () => {
    expect(resolvePosition('front', ['back'])).toBe('back');
    expect(resolvePosition('back', ['front', 'external'])).toBe('front');
  });

  it('returns undefined without a front or back lens', () => {
    expect(resolvePosition('front', [])).toBeUndefined();
    expect(resolvePosition('front', ['external'])).toBeUndefined();
  });
});

describe('canSwitchPosition', () => {
  it('needs both a front and a back lens', () => {
    expect(canSwitchPosition(['front', 'back'])).toBe(true);
    expect(canSwitchPosition(['front', 'back', 'external'])).toBe(true);
    expect(canSwitchPosition(['back'])).toBe(false);
    expect(canSwitchPosition(['front', 'front'])).toBe(false);
  });
});
