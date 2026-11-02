import { privacyPolicyUrl, SITE_URL, supportUrl } from './links';

it('links to the page in the app language', () => {
  expect(privacyPolicyUrl('en')).toBe(`${SITE_URL}/privacy/`);
  expect(privacyPolicyUrl('tr')).toBe(`${SITE_URL}/privacy/tr.html`);
  expect(supportUrl('en')).toBe(`${SITE_URL}/support/`);
  expect(supportUrl('tr')).toBe(`${SITE_URL}/support/tr.html`);
});

it('uses HTTPS (required by both stores)', () => {
  expect(SITE_URL.startsWith('https://')).toBe(true);
});
