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

  it('подключены тонкое и обычное начертания нового дизайна', () => {
    for (const ves of ['300', '400']) {
      expect(css, `нет начертания ${ves}`).toMatch(new RegExp(`font-weight:\\s*${ves}`));
    }
  });

  it('кириллица и латиница покрыты локальными подмножествами Manrope', () => {
    const source = readFileSync('src/styles/fonts.css', 'utf8');
    for (const subset of ['cyrillic-ext', 'cyrillic', 'latin-ext', 'latin']) {
      expect(source).toContain(`Manrope-${subset}.woff2`);
      expect(existsSync(`src/assets/fonts/Manrope-${subset}.woff2`)).toBe(true);
    }
    // Vite embeds the small cyrillic-ext subset as a data URL; names can disappear.
    const faces = css.match(/@font-face\s*\{[^}]+\}/g).filter((f) => f.includes('Manrope'));
    expect(faces.length).toBeGreaterThanOrEqual(8);
    expect(faces.some((f) => /unicode-range:[^}]*u\+0?400-0?45f/i.test(f))).toBe(true);
    expect(faces.some((f) => /unicode-range:[^}]*u\+0?460-0?52f/i.test(f))).toBe(true);
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
    for (const cvet of ['#f0efe9', '#e8e6de', '#322d2a', '#8b8b8b']) {
      expect(nizhniy, `нет цвета ${cvet}`).toContain(cvet);
    }
  });
});
