import { storage } from './storage';

// Versioned so a future, substantially different intro can be shown once more.
const KEY = 'onboarding.completed.v1';

export function loadOnboardingCompleted(): boolean {
  return storage.getBoolean(KEY) ?? false;
}

export function saveOnboardingCompleted(completed: boolean): void {
  if (completed) storage.set(KEY, true);
  else storage.remove(KEY);
}
