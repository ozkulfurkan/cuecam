import { loadOnboardingCompleted, saveOnboardingCompleted } from './onboarding';
import { storage } from './storage';

beforeEach(() => storage.clearAll());

it('is not completed on a fresh install', () => {
  expect(loadOnboardingCompleted()).toBe(false);
});

it('remembers completion and can be reset', () => {
  saveOnboardingCompleted(true);
  expect(loadOnboardingCompleted()).toBe(true);

  saveOnboardingCompleted(false);
  expect(loadOnboardingCompleted()).toBe(false);
});
