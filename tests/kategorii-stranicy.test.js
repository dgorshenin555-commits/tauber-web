import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { kategorii } from '../src/lib/content.js';

const BAZA = '/tauber-web/';
const stranica = (k) => load(readFileSync(`dist/catalog/${k}/index.html`, 'utf8'));
const dannye = (k) => JSON.parse(readFileSync(`content/catalog/${k}.json`, 'utf8'));

describe('страницы категорий', () => {
  it('собраны все десять — по одной на категорию каталога', () => {
    for (const k of kategorii) {
      expect(existsSync(`dist/catalog/${k.klyuch}/index.html`), `нет страницы ${k.klyuch}`).toBe(true);
    }
  });

  it('заголовок и хлебная крошка взяты из содержания', () => {
    for (const k of kategorii) {
      const $ = stranica(k.klyuch);
      const d = dannye(k.klyuch);
      expect($('h1').text().replace(/\s+/g, ' ').trim()).toBe(d.zagolovok);
      expect($('body').text()).toContain(d.hlebnaya_kroshka);
    }
  });

  it('вводный текст и перечисление на месте', () => {
    for (const k of kategorii) {
      const $ = stranica(k.klyuch);
      const d = dannye(k.klyuch);
      for (const abzac of d.vvodnyy_tekst) {
        expect($('body').text(), `в ${k.klyuch} нет вводного абзаца`).toContain(abzac);
      }
      if (d.perechislenie) expect($('body').text()).toContain(d.perechislenie);
    }
  });

  it('все карточки раздела выведены с названиями', () => {
    for (const k of kategorii) {
      const $ = stranica(k.klyuch);
      const d = dannye(k.klyuch);
      const nazvaniya = $('[data-kartochka-razdela] h3').map((_, h) => $(h).text().trim()).get();
      expect(nazvaniya).toEqual(d.kartochki.map((c) => c.zagolovok));
    }
  });

  it('преимущества выведены со значками', () => {
    for (const k of kategorii) {
      const $ = stranica(k.klyuch);
      const d = dannye(k.klyuch);
      expect($('[data-preimushchestvo]').length).toBe(d.preimushchestva.length);
    }
  });

  it('все картинки страниц существуют в сборке', () => {
    for (const k of kategorii) {
      const $ = stranica(k.klyuch);
      $('img[src^="/"]').each((_, img) => {
        const src = $(img).attr('src');
        expect(src.startsWith(BAZA), `картинка ${src} без подпапки`).toBe(true);
        expect(existsSync(`dist/${src.slice(BAZA.length)}`), `нет файла ${src}`).toBe(true);
      });
    }
  });

  it('карточки, ведущие на товар, ссылаются внутрь сайта', () => {
    for (const k of kategorii) {
      const $ = stranica(k.klyuch);
      $('[data-kartochka-razdela] a[href^="/"]').each((_, a) => {
        expect($(a).attr('href')).toMatch(/^\/tauber-web\//);
      });
    }
  });

  it('адрес каталога не ведёт в пустоту', () => {
    expect(existsSync('dist/catalog/index.html'), 'нет страницы по адресу /catalog/').toBe(true);
  });

  it('на странице категории есть шапка и футер, как на главной', () => {
    const $ = stranica('pipelines');
    expect($('header').length).toBe(1);
    expect($('footer').length).toBe(1);
  });
});
