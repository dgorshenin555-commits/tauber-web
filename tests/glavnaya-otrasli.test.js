import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';
import { otrasli, kategorii } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('отрасли на главной', () => {
  it('заголовок секции дословно как в эталоне', () => {
    const zagolovki = $('h2').map((_, h) => $(h).text().trim()).get();
    expect(zagolovki).toContain('Отрасли');
  });

  it('выведены все четыре отрасли из содержания', () => {
    expect($('[data-otrasl]').length).toBe(otrasli.length);
    expect(otrasli).toHaveLength(4);
  });

  it('названия отраслей перенесены дословно и в том же порядке', () => {
    const nazvaniya = $('[data-otrasl] [data-nazvanie]').map((_, n) => $(n).text().trim()).get();
    expect(nazvaniya).toEqual(['Аэропорты', 'Нефтебазы и терминалы', 'Склады ГСМ', 'Промышленные объекты']);
  });

  it('у каждой отрасли выведено описание и её направления ссылками', () => {
    $('[data-otrasl]').each((i, o) => {
      expect($(o).text()).toContain(otrasli[i].opisanie);
      const ssylki = $(o).find('a[href^="/tauber-web/catalog/"]');
      expect(ssylki.length).toBe(otrasli[i].kategorii.length);
    });
  });

  it('направления подписаны короткими названиями категорий', () => {
    const korotkie = new Map(kategorii.map((k) => [k.klyuch, k.korotko]));
    const pervaya = $('[data-otrasl]').first();
    // в ссылке рядом с подписью лежит значок — берём только первый текстовый узел
    const podpisi = pervaya.find('a[href^="/tauber-web/catalog/"]').map((_, a) => $(a).contents().first().text().trim()).get();
    expect(podpisi).toEqual(otrasli[0].kategorii.map((k) => korotkie.get(k)));
  });

  it('отрасли выведены вертикальным списком-гармошкой, как в утверждённом варианте эталона', () => {
    const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8')).join('\n');
    const spisok = css.match(/\.otrasli__spisok[^{]*\{[^}]*\}/);
    expect(spisok, 'нет правила для списка отраслей').toBeTruthy();
    expect(spisok[0], 'список отраслей не должен быть сеткой из карточек').not.toMatch(/repeat\(2/);
  });

  it('строка отрасли раскрывается и с клавиатуры', () => {
    const knopki = $('[data-otrasl] [data-otrasl-knopka]');
    expect(knopki.length).toBe(4);
    knopki.each((_, k) => {
      expect($(k).prop('tagName').toLowerCase()).toBe('button');
      expect($(k).attr('aria-expanded')).toMatch(/^(true|false)$/);
    });
  });

  it('первая отрасль раскрыта, остальные свёрнуты', () => {
    const sostoyaniya = $('[data-otrasl] [data-otrasl-knopka]').map((_, k) => $(k).attr('aria-expanded')).get();
    expect(sostoyaniya).toEqual(['true', 'false', 'false', 'false']);
  });

  it('у секции есть подзаголовок из эталона', () => {
    expect($('body').text()).toContain('Решения для объектов, где важны надёжность и безопасность');
  });

  it('нет подписи с жёсткой формой числа — «5 направления каталога» звучало бы неграмотно', () => {
    expect($('body').text()).not.toContain('направления каталога');
  });

  it('у каждой отрасли есть порядковый номер с ведущим нулём', () => {
    const nomera = $('[data-otrasl] [data-nomer]').map((_, n) => $(n).text().trim()).get();
    expect(nomera).toEqual(['01', '02', '03', '04']);
  });
});
