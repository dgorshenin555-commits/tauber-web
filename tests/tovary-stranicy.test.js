import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';

const BAZA = '/tauber-web/';
const TOVARY = readdirSync('content/tovary').filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
const stranica = (k) => load(readFileSync(`dist/catalog/${k}/index.html`, 'utf8'));
const dannye = (k) => JSON.parse(readFileSync(`content/tovary/${k}.json`, 'utf8'));

describe('страницы товаров', () => {
  it('все шестнадцать собраны', () => {
    // «Пробоотборники» в эталоне одновременно категория и товар — оставлена категорией
    expect(TOVARY.length).toBe(16);
    for (const k of TOVARY) {
      expect(existsSync(`dist/catalog/${k}/index.html`), `нет страницы товара ${k}`).toBe(true);
    }
  });

  it('заголовок берётся из содержания', () => {
    for (const k of TOVARY) {
      const d = dannye(k);
      expect(stranica(k)('h1').text().replace(/\s+/g, ' ').trim()).toBe(d.zagolovok);
    }
  });

  it('ключевые факты выведены', () => {
    for (const k of TOVARY) {
      const d = dannye(k);
      if (!d.fakty.length) continue;
      expect(stranica(k)('[data-fakt]').length, `нет фактов на ${k}`).toBe(d.fakty.length);
    }
  });

  it('все секции содержания попали на страницу', () => {
    for (const k of TOVARY) {
      const d = dannye(k);
      const $ = stranica(k);
      expect($('[data-sekciya]').length, `секции ${k} не выведены`).toBe(d.sekcii.length);
      for (const s of d.sekcii) {
        if (s.zagolovok) expect($('body').text(), `нет заголовка «${s.zagolovok}» на ${k}`).toContain(s.zagolovok);
      }
    }
  });

  it('подбор решения выводится там, где он есть в содержании', () => {
    for (const k of TOVARY) {
      const d = dannye(k);
      const $ = stranica(k);
      if (d.podbor) {
        expect($('[data-podbor]').length, `нет подбора на ${k}`).toBe(1);
        expect($('body').text()).toContain(d.podbor.zagolovok);
      } else {
        expect($('[data-podbor]').length, `лишний подбор на ${k}`).toBe(0);
      }
    }
  });

  it('форма подбора собирает выбранное в письмо и не требует сервера', () => {
    const sVyborom = TOVARY.filter((k) => dannye(k).podbor?.tip === 'vybor');
    expect(sVyborom.length).toBeGreaterThan(0);
    const $ = stranica(sVyborom[0]);
    expect($('[data-podbor] select').length).toBeGreaterThan(0);
    expect($('[data-podbor] [data-otpravit]').length).toBe(1);
  });

  it('все картинки страниц товаров существуют в сборке', () => {
    for (const k of TOVARY) {
      const $ = stranica(k);
      $('img[src^="/"]').each((_, img) => {
        const src = $(img).attr('src');
        expect(src.startsWith(BAZA), `${src} без подпапки`).toBe(true);
        expect(existsSync(`dist/${src.slice(BAZA.length)}`), `нет файла ${src} на ${k}`).toBe(true);
      });
    }
  });

  it('карточки категорий ведут на настоящие страницы товаров, а не в пустоту', () => {
    const $ = load(readFileSync('dist/catalog/pipelines/index.html', 'utf8'));
    const ssylki = $('[data-kartochka-razdela] a[href*="/catalog/"]')
      .map((_, a) => $(a).attr('href')).get()
      .filter((h) => !h.endsWith('/pipelines/'));
    expect(ssylki.length).toBeGreaterThan(0);
    for (const h of ssylki) {
      const klyuch = h.replace(/^\/tauber-web\/catalog\/|\/$/g, '');
      expect(existsSync(`dist/catalog/${klyuch}/index.html`), `ссылка ${h} ведёт в пустоту`).toBe(true);
    }
  });
});
