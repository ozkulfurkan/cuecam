import { KEY_BINDINGS } from './keyBindings';
import { actionForKey, buildKeymap, conflictingKeys, normalizeKey } from './keymap';

const press = (key: string, platform = 'android', repeat = false) =>
  actionForKey({ key, platform, repeat });

describe('KEY_BINDINGS', () => {
  it('binds every key to a single action', () => {
    expect(conflictingKeys(KEY_BINDINGS)).toEqual([]);
  });

  it('detects a key bound twice', () => {
    expect(
      conflictingKeys({ ...KEY_BINDINGS, speedUp: ['ArrowUp', 'Space'], speedDown: ['ArrowDown'] }),
    ).toEqual(['Space']);
  });
});

describe('actionForKey', () => {
  it('pauses and resumes with Space and Enter', () => {
    expect(press('Space')).toBe('togglePause');
    expect(press('Enter')).toBe('togglePause');
    expect(press('NumpadEnter', 'ios')).toBe('togglePause');
  });

  it('changes speed with the up and down arrows', () => {
    expect(press('ArrowUp')).toBe('speedUp');
    expect(press('ArrowDown')).toBe('speedDown');
  });

  it('jumps with page up/down (page-turner remotes) and left/right', () => {
    expect(press('PageDown')).toBe('jumpForward');
    expect(press('PageUp')).toBe('jumpBack');
    expect(press('ArrowRight', 'ios')).toBe('jumpForward');
    expect(press('ArrowLeft', 'ios')).toBe('jumpBack');
  });

  it('starts and stops recording with its own key', () => {
    expect(press('KeyR')).toBe('toggleRecording');
    expect(press('KeyR', 'ios')).toBe('toggleRecording');
  });

  it('maps raw Android media key codes, not the same numbers on iOS', () => {
    expect(press('85', 'android')).toBe('togglePause');
    expect(press('130', 'android')).toBe('toggleRecording');
    expect(press('85', 'ios')).toBeUndefined();
  });

  it('leaves volume keys and unbound keys alone', () => {
    expect(press('24', 'android')).toBeUndefined();
    expect(press('KeyX')).toBeUndefined();
  });

  it('repeats speed and jumps while held, but never toggles', () => {
    expect(press('ArrowUp', 'android', true)).toBe('speedUp');
    expect(press('PageDown', 'android', true)).toBe('jumpForward');
    expect(press('Space', 'android', true)).toBeUndefined();
    expect(press('KeyR', 'android', true)).toBeUndefined();
  });

  it('works with a custom keymap', () => {
    const keymap = buildKeymap({ ...KEY_BINDINGS, toggleRecording: ['android:24'] });
    expect(actionForKey({ key: '24', platform: 'android' }, keymap)).toBe('toggleRecording');
    expect(actionForKey({ key: 'KeyR', platform: 'android' }, keymap)).toBeUndefined();
  });
});

describe('normalizeKey', () => {
  it('qualifies raw key codes with the platform and keeps named keys', () => {
    expect(normalizeKey('24', 'android')).toBe('android:24');
    expect(normalizeKey('Space', 'ios')).toBe('Space');
  });
});
