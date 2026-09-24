import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
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

  it('меню не остаётся висеть при переходе на широкий экран', () => {
    const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8')).join('\n');
    // минификатор переписывает медиазапросы в синтаксис диапазонов: (width>=1025px)
    expect(css, 'нет правила, скрывающего мобильное меню на широком экране')
      .toMatch(/(min-width:\s*1025px|width\s*>=\s*1025px)/);
  });

  it('прокрутка блокируется на корневом элементе — на body она бы не сработала', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).toContain('documentElement');
    expect(html).not.toContain("body.style.overflow");
  });

  it('ссылки мобильного меню ведут на страницы категорий', () => {
    $('#mobilnoe-menyu a').each((_, a) => {
      expect($(a).attr('href')).toMatch(/^\/tauber-web\/catalog\/[a-z0-9-]+\/$/);
    });
  });
});
