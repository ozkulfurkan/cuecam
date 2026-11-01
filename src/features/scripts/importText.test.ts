import { appendText, titleFromFileName } from './importText';

describe('appendText', () => {
  it('fills an empty script', () => {
    expect(appendText('', '  Hello\n')).toBe('Hello');
    expect(appendText('  \n', 'Hello')).toBe('Hello');
  });

  it('adds after a blank line', () => {
    expect(appendText('First part\n', 'Second part')).toBe('First part\n\nSecond part');
  });

  it('normalises Windows line endings and a BOM', () => {
    expect(appendText('', '﻿Line 1\r\nLine 2\rLine 3')).toBe('Line 1\nLine 2\nLine 3');
  });

  it('ignores empty input', () => {
    expect(appendText('Keep me', '   \n ')).toBe('Keep me');
  });
});

describe('titleFromFileName', () => {
  it('drops the extension', () => {
    expect(titleFromFileName('Weekly update.txt')).toBe('Weekly update');
    expect(titleFromFileName('notes.v2.TXT')).toBe('notes.v2');
    expect(titleFromFileName('README')).toBe('README');
  });
});
