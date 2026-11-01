import { loadVideoQuality, saveVideoQuality } from '@/storage/appSettings';
import { storage } from '@/storage/storage';

import { qualityLabel, resolutionFor } from './videoQuality';

beforeEach(() => storage.clearAll());

it('maps each quality to a portrait 16:9 size', () => {
  expect(resolutionFor('720p')).toEqual({ width: 720, height: 1280 });
  expect(resolutionFor('1080p')).toEqual({ width: 1080, height: 1920 });
  expect(resolutionFor('4k')).toEqual({ width: 2160, height: 3840 });
});

it('labels 4K in capitals', () => {
  expect(qualityLabel('4k')).toBe('4K');
  expect(qualityLabel('1080p')).toBe('1080p');
});

it('defaults to 1080p and remembers the choice', () => {
  expect(loadVideoQuality()).toBe('1080p');
  saveVideoQuality('4k');
  expect(loadVideoQuality()).toBe('4k');
});

it('ignores unknown stored values', () => {
  storage.set('settings.videoQuality', '8k');
  expect(loadVideoQuality()).toBe('1080p');
});
