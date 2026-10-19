import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

const page = (path) => load(readFileSync(`dist/${path}/index.html`, 'utf8'));
const titles = ($) => $('[data-kartochka-razdela] h3').map((_, item) => $(item).text().trim()).get();

describe('обслуживание самолета на стоянке по новому плану', () => {
  it('показывает шесть направлений в заданном порядке без внутренних номеров', () => {
    const $ = page('catalog/ground');
    expect(titles($)).toEqual([
      'Аэродромные разъемы LPA, кабель 400 Гц',
      'Кабельный удлинитель',
      'ПИТ-системы',
      'Аэродромные источники электропитания',
      'Аэродромные мобильные источники питания',
      'Аэродромные выпрямители 28V',
    ]);
    expect($('main').text()).not.toMatch(/\b4(?:\.[1-6])?\./);
    expect($('main').text()).not.toMatch(/кэдди|PCA|кондиционирование/i);
  });

  it('сохраняет вложенность ПИТ-систем и источников электропитания', () => {
    const $ = page('catalog/ground');
    const cards = $('[data-kartochka-razdela]');
    expect(cards.eq(2).find('li').map((_, item) => $(item).text().trim()).get()).toEqual([
      'Лифтовая ПИТ-система (Pop-up)',
      'ПИТ-системы с откидными крышками',
    ]);
    expect(cards.eq(3).find('li').map((_, item) => $(item).text().trim()).get()).toEqual([
      'Подвесные', 'Стационарные', 'Мобильные',
    ]);
    expect(cards.eq(2).find('a').attr('href')).toBe('/tauber-web/catalog/pit/');
    expect(cards.eq(4).find('a').attr('href')).toBe('/tauber-web/catalog/mobile-power/');
    for (const i of [0, 1, 3, 5]) expect(cards.eq(i).find('a').length).toBe(0);
  });

  it('оставляет в разделе ПИТ только два согласованных исполнения', () => {
    const $ = page('catalog/pit');
    expect(titles($)).toEqual([
      'Лифтовая ПИТ-система (Pop-up)',
      'ПИТ-системы с откидными крышками',
    ]);
    expect($('main').text()).not.toMatch(/PCA|PowerPack|вода|канализация/i);
  });

  it('заменяет Кэдди на мобильные источники питания во всех входах каталога', () => {
    const $ = page('');
    expect($('a[href$="/catalog/mobile-power/"]').length).toBeGreaterThan(0);
    expect($('body').text()).not.toMatch(/кэдди/i);
    expect(page('catalog/mobile-power')('h1').text().trim()).toBe('Аэродромные мобильные источники питания');
    for (const oldPage of ['caddy', 'cdm', 'cable', 'plug', 'power', 'pca', 'pitp']) {
      expect(existsSync(`dist/catalog/${oldPage}/index.html`), `прежняя страница ${oldPage} всё ещё опубликована`).toBe(false);
    }
  });
});
