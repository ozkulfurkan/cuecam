import {
  createScript,
  deleteScript,
  displayTitle,
  parseScripts,
  preview,
  searchScripts,
  sortScripts,
  updateScript,
} from './scripts';

const a = createScript('a', 100, { title: 'Ürün tanıtımı', body: 'İstanbul ofisimizden selamlar' });
const b = createScript('b', 200, { title: 'Weekly update', body: 'Résumé of the week' });

describe('create / update / delete', () => {
  it('creates an empty script with timestamps', () => {
    expect(createScript('x', 5)).toEqual({
      id: 'x',
      title: '',
      body: '',
      createdAt: 5,
      updatedAt: 5,
    });
  });

  it('updates only the matching script and bumps updatedAt', () => {
    const [first, second] = updateScript([a, b], 'a', { body: 'new' }, 300);
    expect(first).toEqual({ ...a, body: 'new', updatedAt: 300 });
    expect(second).toBe(b);
  });

  it('ignores unknown ids', () => {
    expect(updateScript([a], 'zzz', { title: 'x' }, 300)).toEqual([a]);
  });

  it('deletes by id', () => {
    expect(deleteScript([a, b], 'a')).toEqual([b]);
  });
});

it('sorts most recently edited first', () => {
  expect(sortScripts([a, b]).map((s) => s.id)).toEqual(['b', 'a']);
});

describe('searchScripts', () => {
  it('returns everything for an empty query', () => {
    expect(searchScripts([a, b], '  ')).toEqual([a, b]);
  });

  it('matches title or text, case- and accent-insensitively', () => {
    expect(searchScripts([a, b], 'URUN')).toEqual([a]);
    expect(searchScripts([a, b], 'istanbul')).toEqual([a]);
    expect(searchScripts([a, b], 'resume')).toEqual([b]);
  });

  it('requires every word of the query', () => {
    expect(searchScripts([a, b], 'weekly week')).toEqual([b]);
    expect(searchScripts([a, b], 'weekly istanbul')).toEqual([]);
  });
});

describe('displayTitle', () => {
  it('prefers the title, then the first line, then a fallback', () => {
    expect(displayTitle({ title: ' Intro ', body: 'x' }, 'Untitled')).toBe('Intro');
    expect(displayTitle({ title: '', body: '\n Hello there\nmore' }, 'Untitled')).toBe(
      'Hello there',
    );
    expect(displayTitle({ title: '', body: '  ' }, 'Untitled')).toBe('Untitled');
  });
});

describe('preview', () => {
  it('flattens whitespace and shortens long text', () => {
    expect(preview('one\n\ntwo   three')).toBe('one two three');
    const long = preview('word '.repeat(50), 20);
    expect(long.length).toBeLessThanOrEqual(20);
    expect(long.endsWith('…')).toBe(true);
  });
});

describe('parseScripts', () => {
  it('keeps valid scripts and drops malformed entries', () => {
    const stored: unknown = [a, { id: 1 }, null, 'x', { ...b, title: 3 }];
    expect(parseScripts(stored)).toEqual([a]);
  });

  it('returns an empty list for non-arrays', () => {
    expect(parseScripts(undefined)).toEqual([]);
    expect(parseScripts({})).toEqual([]);
  });
});
