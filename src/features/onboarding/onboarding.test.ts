import { en } from '@/i18n/en';

import { isLastPage, nextPage, ONBOARDING_PAGES, previousPage } from './onboarding';

it('has three pages, ending with the permission reasons', () => {
  expect(ONBOARDING_PAGES.map((page) => page.id)).toEqual(['welcome', 'controls', 'privacy']);
});

it('only uses existing strings', () => {
  for (const page of ONBOARDING_PAGES) {
    for (const key of [page.titleKey, page.bodyKey, ...page.pointKeys]) {
      expect(en[key]).toBeTruthy();
    }
  }
});

it('explains every permission the app asks for on the last page', () => {
  const last = ONBOARDING_PAGES[ONBOARDING_PAGES.length - 1];
  expect(last.pointKeys).toEqual(
    expect.arrayContaining([
      'onboarding.privacyCamera',
      'onboarding.privacyMicrophone',
      'onboarding.privacyPhotos',
    ]),
  );
});

it('steps forward and back within bounds', () => {
  expect(nextPage(0, 3)).toBe(1);
  expect(nextPage(2, 3)).toBe(2);
  expect(previousPage(1)).toBe(0);
  expect(previousPage(0)).toBe(0);
  expect(isLastPage(1, 3)).toBe(false);
  expect(isLastPage(2, 3)).toBe(true);
});
