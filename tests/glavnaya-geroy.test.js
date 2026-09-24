import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { fotoProizvodstva } from '../src/lib/content.js';

let html, $;
beforeAll(() => {
  html = readFileSync('dist/index.html', 'utf8');
  $ = load(html);
});

describe('герой главной', () => {
  it('заголовок дословно как в эталоне и он единственный h1', () => {
    expect($('h1').length).toBe(1);
    expect($('h1').text().replace(/\s+/g, ' ').trim()).toBe('Собственное производство');
  });

  it('надзаголовок и вводный текст перенесены дословно', () => {
    const tekst = $('body').text();
    expect(tekst).toContain('Полный цикл — от проекта до испытаний');
    expect(tekst).toContain('Проектируем и изготавливаем сложное оборудование');
  });

  it('обе кнопки героя на месте', () => {
    const tekst = $('body').text();
    expect(tekst).toContain('О производстве');
    expect(tekst).toContain('Скачать каталог');
  });

  it('показатели на оранжевой панели дословно из эталона', () => {
    const pokazateli = $('[data-pokazatel]');
    expect(pokazateli.length).toBe(3);
    const tekst = pokazateli.text().replace(/\s+/g, ' ');
    expect(tekst).toContain('15+');
    expect(tekst).toContain('направлений продукции');
    expect(tekst).toContain('25');
    expect(tekst).toContain('лет в отрасли');
    expect(tekst).toContain('100+');
    expect(tekst).toContain('объектов в России и за рубежом');
  });

  it('все четыре фотографии производства выведены с подписями в alt', () => {
    const kadry = $('[data-kadr] img');
    expect(kadry.length).toBe(fotoProizvodstva.length);
    kadry.each((i, img) => {
      expect($(img).attr('alt')).toBe(fotoProizvodstva[i].podpis);
    });
  });

  it('ни одно изображение на странице не осталось без alt', () => {
    const bezAlt = $('img').filter((_, img) => $(img).attr('alt') === undefined).length;
    expect(bezAlt).toBe(0);
  });

  it('переключатели галереи — кнопки, доступные с клавиатуры', () => {
    const tochki = $('[data-tochka]');
    expect(tochki.length).toBe(fotoProizvodstva.length);
    tochki.each((_, t) => {
      expect($(t).prop('tagName').toLowerCase()).toBe('button');
      expect($(t).attr('aria-label')).toBeTruthy();
    });
  });

  it('таймер галереи останавливается при скрытии вкладки и уходе со страницы', () => {
    expect(html).toContain('visibilitychange');
    expect(html).toContain('pagehide');
  });
});
