import { act, renderHook } from '@testing-library/react-native';

import { loadScripts } from '@/storage/scripts';
import { storage } from '@/storage/storage';

import { scriptStore, useScripts } from './scriptStore';

beforeEach(() => {
  storage.clearAll();
  scriptStore.resetForTests();
});

it('persists created, edited and deleted scripts', () => {
  const one = scriptStore.create({ title: 'One', body: 'first' });
  const two = scriptStore.create({ title: 'Two' });
  scriptStore.update(one.id, { body: 'edited' });
  scriptStore.remove(two.id);

  const saved = loadScripts();
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ id: one.id, title: 'One', body: 'edited' });
});

it('reloads scripts saved by an earlier session', () => {
  scriptStore.create({ title: 'Kept' });
  scriptStore.resetForTests();
  expect(scriptStore.getAll().map((s) => s.title)).toEqual(['Kept']);
});

it('gives each script its own id', () => {
  const ids = new Set(Array.from({ length: 20 }, () => scriptStore.create().id));
  expect(ids.size).toBe(20);
});

it('re-renders subscribers on change, newest edit first', async () => {
  const { result } = await renderHook(() => useScripts());
  expect(result.current).toEqual([]);

  let first = '';
  await act(() => {
    first = scriptStore.create({ title: 'A' }).id;
    scriptStore.create({ title: 'B' });
  });
  expect(result.current.map((s) => s.title)).toEqual(['B', 'A']);

  // Editing moves a script to the top.
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);
  await act(() => scriptStore.update(first, { body: 'x' }));
  expect(result.current.map((s) => s.title)).toEqual(['A', 'B']);
  jest.restoreAllMocks();
});

it('survives corrupt stored data', () => {
  storage.set('scripts.v1', '{not json');
  expect(loadScripts()).toEqual([]);
});
