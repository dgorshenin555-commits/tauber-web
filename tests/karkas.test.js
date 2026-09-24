import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

let html, css;

beforeAll(() => {
  html = readFileSync('dist/index.html', 'utf8');
  css = readdirSync('dist/_astro')
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8'))
    .join('\n');
});

describe('каркас', () => {
  it('страница на русском языке', () => {
    expect(load(html)('html').attr('lang')).toBe('ru');
  });

  it('шрифты подключены локально, без Google Fonts', () => {
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
    expect(css).not.toContain('fonts.gstatic.com');
  });

  it('есть все пять начертаний, которые использует дизайн', () => {
    for (const ves of ['400', '500', '600', '700', '800']) {
      expect(css, `нет начертания ${ves}`).toMatch(new RegExp(`font-weight:\\s*${ves}`));
    }
  });

  it('кириллица покрыта всеми четырьмя диапазонами символов', () => {
    // шрифт вариативный: один файл на подмножество покрывает все веса
    const golos = css.match(/GolosText-[a-z-]+\.[A-Za-z0-9_-]+\.woff2/g) ?? [];
    expect(new Set(golos).size).toBe(4);
    for (const subset of ['cyrillic-ext', 'cyrillic', 'latin-ext', 'latin']) {
      expect(css, `нет подмножества ${subset}`).toContain(`GolosText-${subset}.`);
    }
  });

  it('все файлы шрифтов, на которые ссылается вёрстка, есть в сборке', () => {
    const ssylki = new Set([...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map((m) => m[1].replace(/['"]/g, '')));
    expect(ssylki.size).toBeGreaterThan(0);
    for (const s of ssylki) {
      const vnutri = s.replace(/^\/tauber-web\//, '');
      expect(existsSync(`dist/${vnutri}`), `нет файла ${s}`).toBe(true);
    }
  });

  it('токены палитры заданы значениями из эталона', () => {
    // Astro минифицирует CSS и приводит hex к нижнему регистру — сравниваем без учёта регистра.
    const nizhniy = css.toLowerCase();
    for (const cvet of ['#e9efeb', '#edf2ee', '#dee8e1', '#f5761b', '#1c1f21', '#16191c', '#101214', '#e31e24']) {
      expect(nizhniy, `нет цвета ${cvet}`).toContain(cvet);
    }
  });
});
