import * as Sentry from '@sentry/react-native';
import { Album, getPermissionsAsync, requestPermissionsAsync } from 'expo-media-library';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ALBUM_NAME } from '@/features/camera/gallery';

import { creationTimeMs, durationSeconds, sortRecordings, type Recording } from './recordings';

type State =
  | { kind: 'loading' }
  | { kind: 'needs-permission' }
  | { kind: 'ready'; recordings: Recording[] }
  | { kind: 'error'; message: string };

// Same scope as saving: video only, full access (see saveToGallery.ts).
const WRITE_ONLY = false;
const GRANULAR: ['video'] = ['video'];

async function readAlbum(): Promise<Recording[]> {
  const album = await Album.get(ALBUM_NAME);
  if (!album) return [];
  const assets = await album.getAssets();
  const recordings = await Promise.all(
    assets.map(async (asset) => ({
      id: asset.id,
      uri: await asset.getUri(),
      durationSeconds: durationSeconds(await asset.getDuration()),
      createdAt: creationTimeMs(await asset.getCreationTime()),
    })),
  );
  return sortRecordings(recordings);
}

/** Videos in the "Prompter" album, reloaded whenever the screen comes into view. */
export function useRecordings() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  const load = useCallback(async (askForPermission: boolean) => {
    try {
      let permission = await getPermissionsAsync(WRITE_ONLY, GRANULAR);
      if (!permission.granted && askForPermission && permission.canAskAgain) {
        permission = await requestPermissionsAsync(WRITE_ONLY, GRANULAR);
      }
      if (!permission.granted) {
        setState({ kind: 'needs-permission' });
        return;
      }
      setState({ kind: 'ready', recordings: await readAlbum() });
    } catch (error) {
      Sentry.captureException(error);
      setState({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  // Recordings are added from the recorder, so refresh each time the tab is shown.
  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  return { state, requestAccess: () => load(true) };
}
