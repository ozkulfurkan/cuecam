import { useSyncExternalStore } from 'react';

import { loadOnboardingCompleted, saveOnboardingCompleted } from '@/storage/onboarding';

/**
 * Whether the intro has been seen, shared with the root navigator: it guards
 * the routes, so flipping it moves the user between the intro and the app.
 */
let completed: boolean | undefined;
const listeners = new Set<() => void>();

function current(): boolean {
  completed ??= loadOnboardingCompleted();
  return completed;
}

function set(next: boolean) {
  completed = next;
  saveOnboardingCompleted(next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const onboardingStore = {
  isCompleted: current,
  complete: () => set(true),
  /** Shows the intro again (Settings → Show introduction). */
  restart: () => set(false),
  /** Test helper: forget the cache so the next read comes from storage. */
  resetForTests() {
    completed = undefined;
    listeners.clear();
  },
};

export function useOnboardingCompleted(): boolean {
  return useSyncExternalStore(subscribe, current, current);
}
