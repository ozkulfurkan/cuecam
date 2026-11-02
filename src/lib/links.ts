import type { Language } from '@/i18n/translate';

// Public pages served by GitHub Pages from the repo's docs/ folder
// (Settings → Pages → Deploy from branch → main, /docs). The same URLs go into
// App Store Connect and the Play Console (see docs/RELEASE.md).
export const SITE_URL = 'https://ozkulfurkan.github.io/cuecam';

export function privacyPolicyUrl(language: Language): string {
  return language === 'tr' ? `${SITE_URL}/privacy/tr.html` : `${SITE_URL}/privacy/`;
}

export function supportUrl(language: Language): string {
  return language === 'tr' ? `${SITE_URL}/support/tr.html` : `${SITE_URL}/support/`;
}
