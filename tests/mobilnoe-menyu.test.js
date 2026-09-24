import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { kategorii } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('мобильное меню', () => {
  it('бургер — это кнопка, доступная с клавиатуры', () => {
    const burger = $('[data-burger]');
    expect(burger.length).toBe(1);
    expect(burger.prop('tagName').toLowerCase()).toBe('button');
    expect(burger.attr('aria-label')).toBeTruthy();
  });

  it('бургер связан с меню и меню закрыто по умолчанию', () => {
    expect($('[data-burger]').attr('aria-controls')).toBe('mobilnoe-menyu');
    expect($('[data-burger]').attr('aria-expanded')).toBe('false');
    expect($('#mobilnoe-menyu').attr('hidden')).toBeDefined();
  });

  it('в меню перечислены все десять категорий короткими названиями', () => {
    const punkty = $('#mobilnoe-menyu a').map((_, a) => $(a).text().trim()).get();
    for (const k of kategorii) {
      expect(punkty, `в мобильном меню нет категории «${k.korotko}»`).toContain(k.korotko);
    }
  });

  it('ссылки мобильного меню ведут на страницы категорий', () => {
    $('#mobilnoe-menyu a').each((_, a) => {
      expect($(a).attr('href')).toMatch(/^\/catalog\/[a-z0-9-]+\/$/);
    });
  });
});
