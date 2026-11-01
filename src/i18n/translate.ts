import { en, type StringKey } from './en';
import { tr } from './tr';

export type Language = 'en' | 'tr';
export type LanguagePreference = Language | 'system';
export type Params = Record<string, string | number>;

const dictionaries: Record<Language, Record<StringKey, string>> = { en, tr };

/** 'system' follows the phone: Turkish phones get Turkish, everyone else English. */
export function resolveLanguage(
  preference: LanguagePreference,
  deviceLanguageCode: string | null | undefined,
): Language {
  if (preference !== 'system') return preference;
  return deviceLanguageCode?.toLowerCase() === 'tr' ? 'tr' : 'en';
}

/** Looks up `key` and fills {placeholders}; unknown placeholders are left as-is. */
export function translate(language: Language, key: StringKey, params?: Params): string {
  const template = dictionaries[language][key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export type Translate = (key: StringKey, params?: Params) => string;
