import { en } from './en';
import { resolveLanguage, translate } from './translate';
import { tr } from './tr';

describe('resolveLanguage', () => {
  it('uses an explicit choice', () => {
    expect(resolveLanguage('tr', 'en')).toBe('tr');
    expect(resolveLanguage('en', 'tr')).toBe('en');
  });

  it('follows the phone for "system", defaulting to English', () => {
    expect(resolveLanguage('system', 'tr')).toBe('tr');
    expect(resolveLanguage('system', 'TR')).toBe('tr');
    expect(resolveLanguage('system', 'de')).toBe('en');
    expect(resolveLanguage('system', null)).toBe('en');
  });
});

describe('translate', () => {
  it('returns the string for the language', () => {
    expect(translate('en', 'tabs.record')).toBe('Record');
    expect(translate('tr', 'tabs.record')).toBe('Kayıt');
  });

  it('fills placeholders', () => {
    expect(translate('en', 'recorder.saved', { album: 'Prompter' })).toBe(
      'Saved to the "Prompter" album',
    );
    expect(translate('tr', 'scripts.readingTime', { time: '1:20', speed: 4 })).toBe(
      'Hız 4 ile ~1:20',
    );
  });

  it('leaves unknown placeholders visible instead of dropping them', () => {
    expect(translate('en', 'recorder.saved')).toBe('Saved to the "{album}" album');
  });
});

it('has a Turkish string for every English key, using the same placeholders', () => {
  const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    expect(tr[key]).toBeTruthy();
    expect(placeholders(tr[key])).toEqual(placeholders(en[key]));
  }
});
