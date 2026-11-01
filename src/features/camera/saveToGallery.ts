import * as Sentry from '@sentry/react-native';
import { File } from 'expo-file-system';
import { Album, Asset, getPermissionsAsync, requestPermissionsAsync } from 'expo-media-library';

import { ALBUM_NAME, galleryPermissionStep, toFileUri, type SaveResult } from './gallery';

// Only videos are saved, so only video access is requested. On Android 13+
// this maps to READ_MEDIA_VIDEO; older Android uses the storage permissions
// and iOS the Photos permission (full access: albums can't be looked up with
// add-only access).
const WRITE_ONLY = false;
const GRANULAR: ['video'] = ['video'];

async function ensurePermission(): Promise<SaveResult | undefined> {
  let permission = await getPermissionsAsync(WRITE_ONLY, GRANULAR);
  if (galleryPermissionStep(permission) === 'request') {
    permission = await requestPermissionsAsync(WRITE_ONLY, GRANULAR);
  }
  const step = galleryPermissionStep(permission);
  if (step === 'ready') return undefined;
  return { kind: 'permission-denied', canOpenSettings: step === 'open-settings' };
}

/**
 * The gallery now holds its own copy, so drop the recorder's file from the app
 * cache; otherwise every recording takes up its size twice. Only called after a
 * successful save, so a failed save never loses the video. A failed cleanup is
 * reported but does not turn a successful save into an error.
 */
function deleteTemporaryFile(uri: string) {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    Sentry.captureException(error);
  }
}

/** Copies a finished recording into the "Prompter" gallery album, creating it once. */
export async function saveToGallery(filePath: string): Promise<SaveResult> {
  try {
    const denied = await ensurePermission();
    if (denied) return denied;

    const uri = toFileUri(filePath);
    const album = await Album.get(ALBUM_NAME);
    if (album) {
      await Asset.create(uri, album);
    } else {
      // On Android the album is a "Prompter" folder in shared storage; creating
      // it with the file puts the video there directly. On iOS it is a Photos album.
      await Album.create(ALBUM_NAME, [uri]);
    }
    deleteTemporaryFile(uri);
    return { kind: 'saved' };
  } catch (error) {
    Sentry.captureException(error);
    return { kind: 'failed', message: error instanceof Error ? error.message : String(error) };
  }
}
