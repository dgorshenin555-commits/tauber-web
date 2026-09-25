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
    expect($('#mobilnoe-menyu').prop('tagName').toLowerCase()).toBe('dialog');
    expect($('#mobilnoe-menyu').attr('open')).toBeUndefined();
  });

  it('в меню перечислены все десять категорий короткими названиями', () => {
    const punkty = $('#mobilnoe-menyu nav a').map((_, a) => $(a).find('span:not(.ms)').text().trim()).get();
    for (const k of kategorii) {
      expect(punkty, `в мобильном меню нет категории «${k.korotko}»`).toContain(k.korotko);
    }
  });

  it('боковое меню доступно на всех экранах и имеет кнопку закрытия', () => {
    expect($('#mobilnoe-menyu [data-drawer-close]').length).toBe(1);
    expect($('#mobilnoe-menyu').attr('aria-label')).toBeTruthy();
  });

  it('прокрутка блокируется на корневом элементе — на body она бы не сработала', () => {
    const html = readFileSync('dist/index.html', 'utf8');
    expect(html).toContain('documentElement');
    expect(html).not.toContain("body.style.overflow");
  });

  it('ссылки мобильного меню ведут на страницы категорий', () => {
    $('#mobilnoe-menyu nav a').each((_, a) => {
      expect($(a).attr('href')).toMatch(/^\/tauber-web\/catalog\/[a-z0-9-]+\/$/);
    });
  });
});
