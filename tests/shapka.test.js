import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { sayt } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('шапка', () => {
  it('логотип ведёт на главную', () => {
    const logo = $('header [data-logotip]');
    expect(logo.length).toBe(1);
    expect(logo.attr('href')).toBe('/');
  });

  it('пока файла логотипа нет — в шапке читается название компании', () => {
    const logo = $('header [data-logotip]');
    if (sayt.logotip === null) {
      expect(logo.text().trim()).toBe(sayt.nazvanie);
    } else {
      expect(logo.find('img').attr('alt')).toBe(sayt.nazvanie);
    }
  });

  it('в навигации все пять пунктов верхнего уровня, дословно как в эталоне', () => {
    const punkty = $('header nav [data-punkt]').map((_, a) => $(a).contents().first().text().trim()).get();
    expect(punkty.slice(0, 5)).toEqual(['Продукция', 'Проекты', 'Компания', 'Пресс-центр', 'Контакты']);
  });

  it('пункты без готовой страницы не являются ссылками — иначе они ведут в пустоту', () => {
    const bezStranicy = $('header nav [data-punkt]').filter((_, el) =>
      ['Проекты', 'Компания', 'Пресс-центр', 'Контакты'].includes($(el).contents().first().text().trim()));
    expect(bezStranicy.length).toBe(4);
    bezStranicy.each((_, el) => {
      expect($(el).prop('tagName').toLowerCase()).not.toBe('a');
    });
  });

  it('подменю открывается не только наведением: у «Продукции» есть кнопка с aria-expanded', () => {
    const knopka = $('header [data-podmenyu]');
    expect(knopka.length).toBe(1);
    expect(knopka.prop('tagName').toLowerCase()).toBe('button');
    expect(knopka.attr('aria-expanded')).toBe('false');
    expect(knopka.attr('aria-controls')).toBeTruthy();
  });

  it('пункты подменю присутствуют в разметке, а не подгружаются скриптом', () => {
    // 10 ссылок подменю плюс сама «Продукция» — в разметке, а не из скрипта
    const ssylki = $('header nav a[href^="/catalog/"]');
    expect(ssylki.length).toBeGreaterThanOrEqual(10);
  });

  it('у пунктов подменю есть пояснения и иконки, как в эталоне', () => {
    const podmenyu = $('header [data-kolonka] a');
    expect(podmenyu.length).toBe(10);
    expect(podmenyu.first().find('.ms').length).toBe(1);
    expect($('header [data-kolonka]').length).toBe(3);
  });
});
