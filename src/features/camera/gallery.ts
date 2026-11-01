import type { Translate } from '@/i18n/translate';

/** Product rule: every recording lands in this gallery album. */
export const ALBUM_NAME = 'Prompter';

/**
 * VisionCamera reports plain filesystem paths ("/data/user/0/…/x.mp4");
 * expo-media-library expects file:// URIs.
 */
export function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path.startsWith('/') ? '' : '/'}${path}`;
}

/** The subset of expo-media-library's PermissionResponse this logic needs. */
export type GalleryPermission = {
  granted: boolean;
  canAskAgain: boolean;
  /** iOS: 'limited' when the user allowed only selected photos. */
  accessPrivileges?: 'all' | 'limited' | 'none';
};

export type GalleryPermissionStep = 'ready' | 'request' | 'open-settings';

export function galleryPermissionStep(permission: GalleryPermission): GalleryPermissionStep {
  // iOS "limited" access still lets the app add its own videos and album.
  if (permission.granted) return 'ready';
  return permission.canAskAgain ? 'request' : 'open-settings';
}

export type SaveResult =
  | { kind: 'saved' }
  | { kind: 'permission-denied'; canOpenSettings: boolean }
  | { kind: 'failed'; message: string };

export function saveResultMessage(result: SaveResult, t: Translate): string {
  switch (result.kind) {
    case 'saved':
      return t('recorder.saved', { album: ALBUM_NAME });
    case 'permission-denied':
      return t(result.canOpenSettings ? 'recorder.notSavedSettings' : 'recorder.notSavedDenied');
    case 'failed':
      return t('recorder.notSavedError', { error: result.message });
  }
}
