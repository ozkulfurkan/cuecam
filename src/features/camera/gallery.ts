import type { Translate } from '@/i18n/translate';

import type { InterruptionCause } from './interruption';

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

/** What the recorder shows about the last take: being saved, or how saving went. */
export type SaveStatus = { kind: 'saving' } | SaveResult;

/** Why a take ended early, as shown to the user (see InterruptionCause). */
function endedEarlyLabel(cause: InterruptionCause, t: Translate): string {
  switch (cause) {
    case 'storage-full':
      return t('recorder.stoppedStorageFull');
    case 'system-pressure':
      return t('recorder.stoppedHot');
    default:
      return t('recorder.interrupted');
  }
}

/**
 * The notice under the record button. A take cut short by an interruption
 * (backgrounding, a call, full storage …) says so, so the user knows why it
 * ended early and that the part filmed so far was kept.
 */
export function saveNotice(
  status: SaveStatus,
  interruptedBy: InterruptionCause | undefined,
  t: Translate,
): string {
  if (interruptedBy === undefined) {
    return status.kind === 'saving' ? t('recorder.saving') : saveResultMessage(status, t);
  }
  const why = endedEarlyLabel(interruptedBy, t);
  switch (status.kind) {
    case 'saving':
      return t('recorder.keptSaving', { why });
    case 'saved':
      return t('recorder.keptSaved', { why, album: ALBUM_NAME });
    default:
      return t('recorder.keptNotSaved', { why, reason: saveResultMessage(status, t) });
  }
}
