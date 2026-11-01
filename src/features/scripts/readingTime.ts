/**
 * Reading-time estimate shown next to each script.
 *
 * Must agree with the prompter (see prompter/scroll.ts): each speed level adds
 * 0.125 lines per second, and a line of the narrow prompter column holds about
 * five words — so one level ≈ 37.5 words per minute, and the default level 4
 * ≈ 150 wpm, a normal speaking pace.
 */
const WORDS_PER_MINUTE_PER_LEVEL = 37.5;

/** Counts words in any script, including Turkish and accented text. */
export function countWords(text: string): number {
  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function wordsPerMinute(speed: number): number {
  return speed * WORDS_PER_MINUTE_PER_LEVEL;
}

/** Seconds needed to read `words` at prompter `speed`, rounded up. */
export function estimateReadingSeconds(words: number, speed: number): number {
  if (words <= 0 || speed <= 0) return 0;
  return Math.ceil((words / wordsPerMinute(speed)) * 60);
}
