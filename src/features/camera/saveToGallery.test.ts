import * as fileSystemModule from 'expo-file-system';
import * as mediaLibraryModule from 'expo-media-library';

import { saveToGallery } from './saveToGallery';

jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

type Permission = { granted: boolean; canAskAgain: boolean };

// Helpers from __mocks__/expo-media-library.ts.
const mediaLibrary = mediaLibraryModule as unknown as {
  setMockGalleryPermission: (current: Permission, afterRequest?: Permission) => void;
  mockPermissionRequests: () => number;
  mockGallery: { albums: Map<string, string[]>; failWith?: string };
};

// Helpers from __mocks__/expo-file-system.ts.
const fileSystem = fileSystemModule as unknown as {
  mockFiles: { existing: Set<string>; deleted: string[] };
};

const GRANTED = { granted: true, canAskAgain: true };
const UNDECIDED = { granted: false, canAskAgain: true };
const BLOCKED = { granted: false, canAskAgain: false };

beforeEach(() => {
  mediaLibrary.mockGallery.albums.clear();
  mediaLibrary.mockGallery.failWith = undefined;
  mediaLibrary.setMockGalleryPermission(GRANTED);
  fileSystem.mockFiles.existing = new Set(['file:///cache/a.mp4', 'file:///cache/b.mp4']);
  fileSystem.mockFiles.deleted = [];
});

it('removes the temporary recording once it is in the gallery', async () => {
  await saveToGallery('/cache/a.mp4');
  expect(fileSystem.mockFiles.deleted).toEqual(['file:///cache/a.mp4']);
});

it('keeps the temporary recording when saving fails or is not allowed', async () => {
  mediaLibrary.mockGallery.failWith = 'No space left';
  await saveToGallery('/cache/a.mp4');

  mediaLibrary.mockGallery.failWith = undefined;
  mediaLibrary.setMockGalleryPermission(BLOCKED);
  await saveToGallery('/cache/b.mp4');

  expect(fileSystem.mockFiles.deleted).toEqual([]);
});

it('creates the Prompter album with the first recording', async () => {
  await expect(saveToGallery('/cache/a.mp4')).resolves.toEqual({ kind: 'saved' });
  expect(mediaLibrary.mockGallery.albums.get('Prompter')).toEqual(['file:///cache/a.mp4']);
});

it('adds later recordings to the existing album', async () => {
  await saveToGallery('/cache/a.mp4');
  await saveToGallery('/cache/b.mp4');
  expect(mediaLibrary.mockGallery.albums.get('Prompter')).toEqual([
    'file:///cache/a.mp4',
    'file:///cache/b.mp4',
  ]);
});

it('asks for permission first when it has not been decided', async () => {
  mediaLibrary.setMockGalleryPermission(UNDECIDED, GRANTED);

  await expect(saveToGallery('/cache/a.mp4')).resolves.toEqual({ kind: 'saved' });
  expect(mediaLibrary.mockPermissionRequests()).toBe(1);
});

it('does not save when the user declines', async () => {
  mediaLibrary.setMockGalleryPermission(UNDECIDED, UNDECIDED);

  await expect(saveToGallery('/cache/a.mp4')).resolves.toEqual({
    kind: 'permission-denied',
    canOpenSettings: false,
  });
  expect(mediaLibrary.mockGallery.albums.size).toBe(0);
});

it('points to Settings without asking again once blocked', async () => {
  mediaLibrary.setMockGalleryPermission(BLOCKED);

  await expect(saveToGallery('/cache/a.mp4')).resolves.toEqual({
    kind: 'permission-denied',
    canOpenSettings: true,
  });
  expect(mediaLibrary.mockPermissionRequests()).toBe(0);
});

it('reports a failed save instead of throwing', async () => {
  mediaLibrary.mockGallery.failWith = 'No space left';

  await expect(saveToGallery('/cache/a.mp4')).resolves.toEqual({
    kind: 'failed',
    message: 'No space left',
  });
});
