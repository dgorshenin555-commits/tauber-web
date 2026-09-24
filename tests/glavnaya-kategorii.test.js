import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';
import { kategorii } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('категории на главной', () => {
  it('заголовок секции дословно как в эталоне', () => {
    const zagolovki = $('h2').map((_, h) => $(h).text().trim()).get();
    expect(zagolovki).toContain('Основные категории');
  });

  it('ровно десять карточек — вариант «5 × 2»', () => {
    expect($('[data-kartochka]').length).toBe(10);
  });

  it('порядок и названия карточек совпадают с содержанием', () => {
    const nazvaniya = $('[data-kartochka] h3').map((_, h) => $(h).text().trim()).get();
    expect(nazvaniya).toEqual(kategorii.map((k) => k.nazvanie));
  });

  it('у каждой карточки показано количество товаров', () => {
    const tekst = $('[data-kartochka]').text().replace(/\s+/g, ' ');
    for (const k of kategorii) {
      expect(tekst, `нет количества «${k.kolichestvo}» для ${k.klyuch}`).toContain(k.kolichestvo);
    }
  });

  it('плашка «Собственное производство» только у своих категорий', () => {
    const splashkoy = $('[data-kartochka][data-svoye="true"]').length;
    expect(splashkoy).toBe(kategorii.filter((k) => k.svoye).length);
    expect(splashkoy).toBe(7);
  });

  it('каждая карточка ведёт на страницу категории', () => {
    $('[data-kartochka]').each((_, k) => {
      expect($(k).find('a').attr('href')).toMatch(/^\/catalog\/[a-z0-9-]+\/$/);
    });
  });

  it('все картинки карточек реально существуют в сборке', () => {
    const kartinki = $('[data-kartochka] img');
    expect(kartinki.length).toBe(10);
    kartinki.each((_, img) => {
      const src = $(img).attr('src');
      expect(existsSync(`dist${src}`), `нет файла ${src}`).toBe(true);
    });
  });
});
