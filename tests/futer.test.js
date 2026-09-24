import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { sayt, kategorii } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('футер', () => {
  it('присутствует', () => {
    expect($('footer').length).toBe(1);
  });

  it('в футере шесть первых категорий, как в эталоне', () => {
    const ssylki = $('footer a[href^="/catalog/"]');
    expect(ssylki.length).toBe(6);
    expect($(ssylki[0]).text().trim()).toBe(kategorii[0].korotko);
  });

  it('телефон и почта берутся из site.json и кликабельны', () => {
    expect($('footer').text()).toContain(sayt.telefon);
    expect($('footer a[href^="tel:"]').length).toBe(1);
    expect($('footer a[href^="mailto:"]').attr('href')).toBe(`mailto:${sayt.pochta}`);
  });

  it('телефон в ссылке записан цифрами, без пробелов и скобок', () => {
    const href = $('footer a[href^="tel:"]').attr('href');
    expect(href).toMatch(/^tel:\+\d{11}$/);
  });

  it('год в подписи текущий', () => {
    expect($('footer').text()).toContain(String(new Date().getFullYear()));
  });
});
