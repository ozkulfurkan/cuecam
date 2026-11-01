import { translate } from '@/i18n/translate';

import {
  ALBUM_NAME,
  galleryPermissionStep,
  saveNotice,
  saveResultMessage,
  toFileUri,
} from './gallery';

const en = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) =>
  translate('en', key, params);

it('saves into the "Prompter" album', () => {
  expect(ALBUM_NAME).toBe('Prompter');
});

describe('toFileUri', () => {
  it('prefixes absolute paths', () => {
    expect(toFileUri('/data/user/0/app/cache/a.mp4')).toBe('file:///data/user/0/app/cache/a.mp4');
  });

  it('leaves file URIs alone', () => {
    expect(toFileUri('file:///var/mobile/a.mov')).toBe('file:///var/mobile/a.mov');
  });

  it('handles relative paths', () => {
    expect(toFileUri('tmp/a.mp4')).toBe('file:///tmp/a.mp4');
  });
});

describe('galleryPermissionStep', () => {
  it('is ready when granted, including iOS limited access', () => {
    expect(galleryPermissionStep({ granted: true, canAskAgain: true })).toBe('ready');
    expect(
      galleryPermissionStep({ granted: true, canAskAgain: true, accessPrivileges: 'limited' }),
    ).toBe('ready');
  });

  it('asks while the OS still allows it', () => {
    expect(galleryPermissionStep({ granted: false, canAskAgain: true })).toBe('request');
  });

  it('points to Settings once the OS stops asking', () => {
    expect(galleryPermissionStep({ granted: false, canAskAgain: false })).toBe('open-settings');
  });
});

describe('saveResultMessage', () => {
  it('describes each outcome', () => {
    expect(saveResultMessage({ kind: 'saved' }, en)).toBe('Saved to the "Prompter" album');
    expect(saveResultMessage({ kind: 'permission-denied', canOpenSettings: true }, en)).toMatch(
      /Settings/,
    );
    expect(saveResultMessage({ kind: 'failed', message: 'disk full' }, en)).toBe(
      'Not saved: disk full',
    );
  });
});

describe('saveNotice', () => {
  it('uses the plain messages for a normal take', () => {
    expect(saveNotice({ kind: 'saving' }, undefined, en)).toBe('Saving to gallery…');
    expect(saveNotice({ kind: 'saved' }, undefined, en)).toBe('Saved to the "Prompter" album');
  });

  it('says an interrupted take was cut short but kept', () => {
    expect(saveNotice({ kind: 'saving' }, 'app-background', en)).toBe(
      'Recording was interrupted — saving the video…',
    );
    expect(saveNotice({ kind: 'saved' }, 'audio-in-use', en)).toBe(
      'Recording was interrupted — video saved to the "Prompter" album',
    );
  });

  it('explains why an interrupted take could not be saved', () => {
    expect(saveNotice({ kind: 'failed', message: 'disk full' }, 'camera-unavailable', en)).toBe(
      'Recording was interrupted. Not saved: disk full',
    );
  });
});

describe('saveNotice for takes stopped by the device', () => {
  it('names full storage and heat as the reason', () => {
    expect(saveNotice({ kind: 'saved' }, 'storage-full', en)).toBe(
      'Recording stopped: storage is almost full — video saved to the "Prompter" album',
    );
    expect(saveNotice({ kind: 'saving' }, 'system-pressure', en)).toBe(
      'Recording stopped: the phone is too hot — saving the video…',
    );
  });
});
