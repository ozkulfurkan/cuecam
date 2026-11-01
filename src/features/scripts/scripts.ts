export type Script = {
  id: string;
  title: string;
  body: string;
  /** Epoch milliseconds. */
  createdAt: number;
  updatedAt: number;
};

export type ScriptChanges = Partial<Pick<Script, 'title' | 'body'>>;

export function createScript(id: string, now: number, changes: ScriptChanges = {}): Script {
  return {
    id,
    title: changes.title ?? '',
    body: changes.body ?? '',
    createdAt: now,
    updatedAt: now,
  };
}

/** Applies edits to one script; returns the list unchanged if the id is unknown. */
export function updateScript(
  scripts: readonly Script[],
  id: string,
  changes: ScriptChanges,
  now: number,
): Script[] {
  return scripts.map((script) =>
    script.id === id ? { ...script, ...changes, updatedAt: now } : script,
  );
}

export function deleteScript(scripts: readonly Script[], id: string): Script[] {
  return scripts.filter((script) => script.id !== id);
}

/** Most recently edited first. */
export function sortScripts(scripts: readonly Script[]): Script[] {
  return [...scripts].sort((a, b) => b.updatedAt - a.updatedAt);
}

// Turkish-aware, accent-insensitive comparison: "İstanbul" matches "istanbul",
// "ÇALIŞ" matches "calis", "Résumé" matches "resume".
function normalize(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** Scripts whose title or text contains every word of the query. */
export function searchScripts(scripts: readonly Script[], query: string): Script[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...scripts];
  return scripts.filter((script) => {
    const haystack = normalize(`${script.title}\n${script.body}`);
    return words.every((word) => haystack.includes(word));
  });
}

/** What to show for a script without a title: its first line, or a fallback. */
export function displayTitle(script: Pick<Script, 'title' | 'body'>, untitled: string): string {
  const title = script.title.trim();
  if (title) return title;
  const firstLine = script.body.trim().split('\n')[0]?.trim();
  return firstLine || untitled;
}

/** A short one-line preview of the script text. */
export function preview(body: string, maxLength = 90): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength - 1).trimEnd()}…` : flat;
}

/** Validates data read from storage; drops anything malformed. */
export function parseScripts(value: unknown): Script[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Script =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.body === 'string' &&
      typeof item.createdAt === 'number' &&
      typeof item.updatedAt === 'number',
  );
}
