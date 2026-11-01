import { countWords, estimateReadingSeconds, wordsPerMinute } from './readingTime';

describe('countWords', () => {
  it('counts words separated by any whitespace or punctuation', () => {
    expect(countWords('Hello,  world!\nHow are you?')).toBe(5);
    expect(countWords('')).toBe(0);
    expect(countWords('  \n ')).toBe(0);
  });

  it('handles Turkish letters, apostrophes and hyphens', () => {
    expect(countWords('Cue Cam’e hoş geldin, İstanbul’dan selamlar')).toBe(6);
    expect(countWords("don't stop well-known")).toBe(3);
  });

  it('counts numbers as words', () => {
    expect(countWords('Step 2 of 10')).toBe(4);
  });
});

describe('estimateReadingSeconds', () => {
  it('reads about 150 words per minute at the default speed', () => {
    expect(wordsPerMinute(4)).toBe(150);
    expect(estimateReadingSeconds(150, 4)).toBe(60);
  });

  it('halves the time at double speed', () => {
    expect(estimateReadingSeconds(300, 8)).toBe(60);
  });

  it('rounds up so short scripts never show 0 seconds', () => {
    expect(estimateReadingSeconds(1, 4)).toBe(1);
  });

  it('is zero for empty text', () => {
    expect(estimateReadingSeconds(0, 4)).toBe(0);
  });
});
