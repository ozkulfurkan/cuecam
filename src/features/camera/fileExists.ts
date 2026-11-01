import { File } from 'expo-file-system';

import { toFileUri } from './gallery';

/** Whether a recorder output file (plain path or file:// URI) is on disk. */
export function fileExists(path: string): boolean {
  try {
    return new File(toFileUri(path)).exists;
  } catch {
    return false;
  }
}
