import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
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
      const ssylki = $(o).find('a[href^="/catalog/"]');
      expect(ssylki.length).toBe(otrasli[i].kategorii.length);
    });
  });

  it('направления подписаны короткими названиями категорий', () => {
    const korotkie = new Map(kategorii.map((k) => [k.klyuch, k.korotko]));
    const pervaya = $('[data-otrasl]').first();
    // в ссылке рядом с подписью лежит значок — берём только первый текстовый узел
    const podpisi = pervaya.find('a[href^="/catalog/"]').map((_, a) => $(a).contents().first().text().trim()).get();
    expect(podpisi).toEqual(otrasli[0].kategorii.map((k) => korotkie.get(k)));
  });

  it('подпись про число направлений считается из содержания, а не вписана руками', () => {
    expect($('[data-otrasl]').first().text()).toContain('4 направления каталога');
  });

  it('у каждой отрасли есть порядковый номер с ведущим нулём', () => {
    const nomera = $('[data-otrasl] [data-nomer]').map((_, n) => $(n).text().trim()).get();
    expect(nomera).toEqual(['01', '02', '03', '04']);
  });
});
