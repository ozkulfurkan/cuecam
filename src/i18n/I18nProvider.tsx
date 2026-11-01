import { getLocales } from 'expo-localization';
import { createContext, use, useMemo, useState, type ReactNode } from 'react';

import { loadLanguagePreference, saveLanguagePreference } from '@/storage/appSettings';

import type { StringKey } from './en';
import {
  resolveLanguage,
  translate,
  type Language,
  type LanguagePreference,
  type Params,
  type Translate,
} from './translate';

type I18n = {
  language: Language;
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
  t: Translate;
};

const I18nContext = createContext<I18n>({
  language: 'en',
  preference: 'system',
  setPreference: () => {},
  t: (key, params) => translate('en', key, params),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState(loadLanguagePreference);
  const language = resolveLanguage(preference, getLocales()[0]?.languageCode);

  const value = useMemo<I18n>(
    () => ({
      language,
      preference,
      setPreference: (next) => {
        saveLanguagePreference(next);
        setPreferenceState(next);
      },
      t: (key: StringKey, params?: Params) => translate(language, key, params),
    }),
    [language, preference],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18n {
  return use(I18nContext);
}
