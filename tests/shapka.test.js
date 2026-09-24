import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';
import { sayt } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('шапка', () => {
  it('логотип ведёт на главную', () => {
    const logo = $('header [data-logotip]');
    expect(logo.length).toBe(1);
    expect(logo.attr('href')).toBe('/tauber-web/');
  });

  it('в шапке стоит знак компании с подписью для читалок', () => {
    const logo = $('header [data-logotip] img');
    expect(logo.length, 'логотип не выводится картинкой').toBe(1);
    expect(logo.attr('alt')).toBe(sayt.nazvanie);
    expect(logo.attr('src')).toMatch(/^\/tauber-web\/images\//);
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

  it('в шапке есть телефон — основной путь обращения, он был в эталоне', () => {
    const tel = $('header a[href^="tel:"]');
    expect(tel.length).toBe(1);
    expect(tel.text()).toContain(sayt.telefon);
  });

  it('в шапке есть кнопка заявки, как в эталоне', () => {
    const knopka = $('header [data-zayavka]');
    expect(knopka.length).toBe(1);
    expect(knopka.attr('href')).toMatch(/^mailto:/);
  });

  it('закрытое подменю убрано из обхода с клавиатуры, а не просто прозрачно', () => {
    const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8')).join('\n');
    // без visibility прозрачная панель оставляет десять невидимых остановок Tab
    expect(css).toMatch(/visibility:\s*hidden/);
    expect(css).toMatch(/visibility:\s*visible/);
  });

  it('подменю раскрывается и при переходе на него с клавиатуры', () => {
    const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8')).join('\n');
    expect(css).toContain('focus-within');
  });

  it('пункты подменю присутствуют в разметке, а не подгружаются скриптом', () => {
    // 10 ссылок подменю плюс сама «Продукция» — в разметке, а не из скрипта
    const ssylki = $('header nav a[href^="/tauber-web/catalog/"]');
    expect(ssylki.length).toBeGreaterThanOrEqual(10);
  });

  it('у пунктов подменю есть пояснения и иконки, как в эталоне', () => {
    const podmenyu = $('header [data-kolonka] a');
    expect(podmenyu.length).toBe(10);
    expect(podmenyu.first().find('.ms').length).toBe(1);
    expect($('header [data-kolonka]').length).toBe(3);
  });
});
