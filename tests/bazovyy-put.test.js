import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

const BAZA = '/tauber-web/';
let $, css;

beforeAll(() => {
  $ = load(readFileSync('dist/index.html', 'utf8'));
  css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8')).join('\n');
});

describe('сайт живёт в подпапке, а не в корне домена', () => {
  it('внутренние ссылки ведут внутрь подпапки, иначе с GitHub Pages они уйдут в пустоту', () => {
    const vnutrennie = $('a[href^="/"]').map((_, a) => $(a).attr('href')).get();
    expect(vnutrennie.length).toBeGreaterThan(0);
    for (const href of vnutrennie) {
      expect(href.startsWith(BAZA), `ссылка ${href} не учитывает подпапку сайта`).toBe(true);
    }
  });

  it('картинки берутся из подпапки', () => {
    const kartinki = $('img[src^="/"]').map((_, i) => $(i).attr('src')).get();
    expect(kartinki.length).toBeGreaterThan(0);
    for (const src of kartinki) {
      expect(src.startsWith(BAZA), `картинка ${src} не учитывает подпапку сайта`).toBe(true);
    }
  });

  it('шрифты подгружаются из подпапки', () => {
    const puti = [...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1].replace(/['"]/g, ''));
    expect(puti.length).toBeGreaterThan(0);
    for (const put of puti) {
      const korrekten = put.startsWith(BAZA) || put.startsWith('data:') || put.startsWith('.');
      expect(korrekten, `шрифт ${put} не учитывает подпапку сайта`).toBe(true);
    }
  });

  it('файлы, на которые ссылается страница, лежат в сборке по этим же путям', () => {
    const vse = [
      ...$('img[src^="/"]').map((_, i) => $(i).attr('src')).get(),
      ...[...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1].replace(/['"]/g, '')),
    ].filter((p) => p.startsWith(BAZA));
    for (const put of vse) {
      const vnutri = put.slice(BAZA.length);
      expect(existsSync(`dist/${vnutri}`), `нет файла dist/${vnutri}`).toBe(true);
    }
  });
});
