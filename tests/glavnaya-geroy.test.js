import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
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

  it('заголовок тянется за шириной колонки, а не держит фиксированный кегль', () => {
    // колонка героя задана процентом: фиксированные 78px вылезают из неё на ноутбуках 1281-1600px
    const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8')).join('\n');
    expect(css).toMatch(/clamp\([^)]*78px\)/);
    expect(css).toMatch(/overflow-wrap:\s*(anywhere|break-word)/);
  });

  it('кнопки героя — живые ссылки, а не надписи', () => {
    const knopki = $('[data-knopka-gero]');
    expect(knopki.length).toBe(3);
    knopki.each((_, k) => {
      expect($(k).prop('tagName').toLowerCase()).toBe('a');
      expect($(k).attr('href'), 'у кнопки героя нет адреса').toBeTruthy();
    });
  });

  it('у галереи есть кнопки перелистывания, как в эталоне', () => {
    expect($('[data-galereya-nazad]').length).toBe(1);
    expect($('[data-galereya-vpered]').length).toBe(1);
    for (const sel of ['[data-galereya-nazad]', '[data-galereya-vpered]']) {
      expect($(sel).prop('tagName').toLowerCase()).toBe('button');
      expect($(sel).attr('aria-label')).toBeTruthy();
    }
  });

  it('по точкам можно попасть пальцем — область нажатия не меньше 24 пикселей', () => {
    const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8')).join('\n');
    const pravilo = css.match(/\.galereya__tochka[^{]*\{[^}]*\}/);
    expect(pravilo, 'нет правила для точки галереи').toBeTruthy();
    expect(pravilo[0], 'точка 8x8 без увеличенной области нажатия').toMatch(/min-(width|height):\s*24px|padding/);
  });

  it('галерея останавливается, когда на неё смотрят, и уважает «уменьшить движение»', () => {
    expect(html).toContain('mouseenter');
    expect(html).toContain('focusin');
    expect(html).toContain('prefers-reduced-motion');
  });

  it('таймер галереи останавливается при скрытии вкладки и уходе со страницы', () => {
    expect(html).toContain('visibilitychange');
    expect(html).toContain('pagehide');
  });
});
