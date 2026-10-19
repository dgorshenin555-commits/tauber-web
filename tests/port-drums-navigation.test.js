import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

const page = (path) => load(readFileSync(`dist/${path}/index.html`, 'utf8'));

describe('новые направления и навигация по плану владельца', () => {
  it('публикует береговые колонки питания в порту от 1кВ', () => {
    const home = page('');
    expect(home('[data-kartochka] a[href$="/catalog/shore-power/"] h3').text()).toBe('Береговые колонки питания в порту от 1кВ');
    expect(page('catalog/shore-power')('h1').text().trim()).toBe('Береговые колонки питания в порту от 1кВ');
  });

  it('показывает два вида барабанов без внутренней нумерации', () => {
    const $ = page('catalog/drums');
    expect($('h1').text().trim()).toBe('Барабаны');
    expect($('[data-kartochka-razdela] h3').map((_, item) => $(item).text().trim()).get()).toEqual([
      'Кабельный пружинный барабан',
      'Кабельный приводной барабан',
    ]);
    expect($('main').text()).not.toMatch(/\b6(?:\.[12])?\./);
    expect($('[data-kartochka-razdela] a').length).toBe(0);
  });

  it('убирает кольца PSI из активного каталога', () => {
    expect(page('catalog/pipelines')('main').text()).not.toMatch(/PSI/i);
    expect(existsSync('dist/catalog/psi/index.html')).toBe(false);
  });

  it('делает все четыре верхние вкладки рабочими ссылками на страницы', () => {
    const $ = page('');
    const routes = { 'Проекты': 'projects', 'Компания': 'company', 'Пресс-центр': 'press', 'Контакты': 'contacts' };
    for (const [name, route] of Object.entries(routes)) {
      expect($(`header nav [data-punkt][href="/tauber-web/${route}/"]`).text()).toBe(name);
      expect(existsSync(`dist/${route}/index.html`), `нет страницы ${route}`).toBe(true);
      expect(page(route)('h1').text().trim()).toBe(name);
      expect($(`#mobilnoe-menyu a[href="/tauber-web/${route}/"]`).length).toBe(1);
    }
  });
});
