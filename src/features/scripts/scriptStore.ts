import { useSyncExternalStore } from 'react';

import { loadScripts, saveScripts } from '@/storage/scripts';

import {
  createScript,
  deleteScript,
  sortScripts,
  updateScript,
  type Script,
  type ScriptChanges,
} from './scripts';

/**
 * In-memory copy of the saved scripts, shared by every screen. Each change is
 * written to MMKV straight away (synchronous and fast), and subscribed screens
 * re-render — so an edit in the editor shows up in the list without reloading.
 */
let scripts: Script[] | undefined;
const listeners = new Set<() => void>();

function current(): Script[] {
  scripts ??= sortScripts(loadScripts());
  return scripts;
}

function commit(next: Script[]) {
  scripts = sortScripts(next);
  saveScripts(scripts);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Unique enough for local data: time prefix keeps ids roughly sortable.
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const scriptStore = {
  getAll: current,
  get: (id: string) => current().find((script) => script.id === id),
  create(changes: ScriptChanges = {}): Script {
    const script = createScript(newId(), Date.now(), changes);
    commit([script, ...current()]);
    return script;
  },
  update(id: string, changes: ScriptChanges) {
    commit(updateScript(current(), id, changes, Date.now()));
  },
  remove(id: string) {
    commit(deleteScript(current(), id));
  },
  /** Test helper: forget the cache so the next read comes from storage. */
  resetForTests() {
    scripts = undefined;
    listeners.clear();
  },
};

/** All scripts, most recently edited first; re-renders on every change. */
export function useScripts(): Script[] {
  return useSyncExternalStore(subscribe, current);
}

export function useScript(id: string | undefined): Script | undefined {
  const all = useScripts();
  return id === undefined ? undefined : all.find((script) => script.id === id);
}
