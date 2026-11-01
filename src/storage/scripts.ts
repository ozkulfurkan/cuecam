import { parseScripts, type Script } from '@/features/scripts/scripts';

import { storage } from './storage';

// Versioned key: a future format change can migrate from v1 instead of guessing.
const SCRIPTS_KEY = 'scripts.v1';
const LAST_SCRIPT_KEY = 'scripts.lastUsedId';

export function loadScripts(): Script[] {
  const raw = storage.getString(SCRIPTS_KEY);
  if (!raw) return [];
  try {
    return parseScripts(JSON.parse(raw));
  } catch {
    // Corrupt data must not crash the app; start from an empty list.
    return [];
  }
}

export function saveScripts(scripts: readonly Script[]): void {
  storage.set(SCRIPTS_KEY, JSON.stringify(scripts));
}

/** The script last opened in the recorder, so the Record tab can reopen it. */
export function loadLastScriptId(): string | undefined {
  return storage.getString(LAST_SCRIPT_KEY);
}

export function saveLastScriptId(id: string | undefined): void {
  if (id === undefined) storage.remove(LAST_SCRIPT_KEY);
  else storage.set(LAST_SCRIPT_KEY, id);
}
