import type { SymbolViewProps } from 'expo-symbols';

import type { StringKey } from '@/i18n/en';

export type OnboardingPage = {
  id: 'welcome' | 'controls' | 'privacy';
  icon: SymbolViewProps['name'];
  titleKey: StringKey;
  bodyKey: StringKey;
  /** Short bullet points under the body. */
  pointKeys: readonly StringKey[];
};

/**
 * The first-launch intro: what the app does, how to drive the prompter, and
 * why it asks for each permission (asked on the last page, after the reason
 * has been shown — never cold on first launch).
 */
export const ONBOARDING_PAGES: readonly OnboardingPage[] = [
  {
    id: 'welcome',
    icon: { ios: 'video.badge.waveform', android: 'videocam' },
    titleKey: 'onboarding.welcomeTitle',
    bodyKey: 'onboarding.welcomeBody',
    pointKeys: ['onboarding.welcomePoint1', 'onboarding.welcomePoint2'],
  },
  {
    id: 'controls',
    icon: { ios: 'hand.tap', android: 'touch_app' },
    titleKey: 'onboarding.controlsTitle',
    bodyKey: 'onboarding.controlsBody',
    pointKeys: [
      'onboarding.controlsPoint1',
      'onboarding.controlsPoint2',
      'onboarding.controlsPoint3',
      'onboarding.controlsPoint4',
    ],
  },
  {
    id: 'privacy',
    icon: { ios: 'lock.shield', android: 'shield_lock' },
    titleKey: 'onboarding.privacyTitle',
    bodyKey: 'onboarding.privacyBody',
    pointKeys: [
      'onboarding.privacyCamera',
      'onboarding.privacyMicrophone',
      'onboarding.privacyPhotos',
    ],
  },
];

export function isLastPage(index: number, count = ONBOARDING_PAGES.length): boolean {
  return index >= count - 1;
}

/** Next page index, staying on the last page. */
export function nextPage(index: number, count = ONBOARDING_PAGES.length): number {
  return Math.min(index + 1, count - 1);
}

/** Previous page index, staying on the first page. */
export function previousPage(index: number): number {
  return Math.max(index - 1, 0);
}
