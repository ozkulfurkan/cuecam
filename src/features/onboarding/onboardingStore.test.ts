import { act, renderHook } from '@testing-library/react-native';

import { loadOnboardingCompleted } from '@/storage/onboarding';
import { storage } from '@/storage/storage';

import { onboardingStore, useOnboardingCompleted } from './onboardingStore';

beforeEach(() => {
  storage.clearAll();
  onboardingStore.resetForTests();
});

it('starts incomplete, completes, persists and restarts', async () => {
  const { result } = await renderHook(() => useOnboardingCompleted());
  expect(result.current).toBe(false);

  await act(() => onboardingStore.complete());
  expect(result.current).toBe(true);
  expect(loadOnboardingCompleted()).toBe(true);

  await act(() => onboardingStore.restart());
  expect(result.current).toBe(false);
  expect(loadOnboardingCompleted()).toBe(false);
});
