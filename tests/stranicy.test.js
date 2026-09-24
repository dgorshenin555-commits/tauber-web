import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { load } from 'cheerio';

describe('страница «не найдено»', () => {
  it('собирается, чтобы ссылки на будущие разделы не приводили в тупик', () => {
    expect(existsSync('dist/404.html')).toBe(true);
  });

  it('объясняет, что происходит, и даёт путь назад', () => {
    const $ = load(readFileSync('dist/404.html', 'utf8'));
    expect($('body').text()).toContain('готовится');
    expect($('a[href="/tauber-web/"]').length).toBeGreaterThan(0);
  });
});
