/**
 * Adds imported text (clipboard or .txt file) to a script. Empty scripts take
 * it as-is; otherwise it goes after a blank line so paragraphs stay apart.
 * Windows line endings and a leading BOM are normalised.
 */
export function appendText(existing: string, incoming: string): string {
  const clean = incoming.replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!clean) return existing;
  const base = existing.trimEnd();
  return base ? `${base}\n\n${clean}` : clean;
}

/** "Weekly update.txt" → "Weekly update"; used when the script has no title yet. */
export function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, '').trim();
}
