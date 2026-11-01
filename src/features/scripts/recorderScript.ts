import type { Script } from './scripts';

/**
 * Which script the recorder shows:
 * 1. the one it was opened for (from the script list or editor),
 * 2. otherwise the one used last time (the Record tab),
 * 3. otherwise the most recently edited one.
 * Returns undefined when there are no scripts; the recorder then shows the sample.
 */
export function resolveRecorderScript(
  scripts: readonly Script[],
  requestedId: string | undefined,
  lastUsedId: string | undefined,
): Script | undefined {
  const byId = (id: string | undefined) =>
    id === undefined ? undefined : scripts.find((script) => script.id === id);
  return byId(requestedId) ?? byId(lastUsedId) ?? scripts[0];
}

/** The text to scroll: the script's own text, or the sample if it is empty. */
export function prompterText(script: Script | undefined, sample: string): string {
  return script?.body.trim() ? script.body : sample;
}
