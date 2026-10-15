import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

const page = (path) => load(readFileSync(`dist/${path}/index.html`, 'utf8'));

describe('гидрантная система по согласованной структуре', () => {
  it('показывает три пункта в заданном порядке и модели люков внутри второго', () => {
    const $ = page('catalog/hydrant');
    expect($('[data-kartochka-razdela] h3').map((_, item) => $(item).text().trim()).get()).toEqual([
      'DJ400-E600',
      'Люки доступа в технологическую камеру',
      'Гидрантный клапан Carter',
    ]);
    expect($('[data-kartochka-razdela]').eq(1).find('li').map((_, item) => $(item).text().trim()).get()).toEqual([
      'DAB-741', 'DAB-38', 'FL-76',
    ]);
  });

  it('убирает старые изделия и не выдаёт карточки без страницы за ссылки', () => {
    const $ = page('catalog/hydrant');
    const content = $('main').text();
    expect(content).not.toMatch(/пантограф|DAB-24|ДАП-24|60554/i);
    expect($('[data-kartochka-razdela]').eq(1).find('a').length).toBe(0);
    expect($('[data-kartochka-razdela]').eq(2).find('a').length).toBe(0);
    expect($('[data-kartochka-razdela]').first().find('a').attr('href')).toBe('/tauber-web/catalog/dj400-e600/');
    expect(existsSync('dist/catalog/dj400-e600/index.html')).toBe(true);
    expect(page('catalog/dj400-e600')('h1').text().trim()).toBe('DJ400-E600');
  });

  it('не показывает пустую панель и не добавляет в запрос о DJ400-E600 текст про агрегат', () => {
    const category = page('catalog/hydrant');
    expect(category('.verh__panel').length).toBe(0);
    const product = page('catalog/dj400-e600');
    const subject = product('.tovar-verh__knopka').attr('href');
    expect(decodeURIComponent(subject)).toContain('DJ400-E600');
    expect(decodeURIComponent(subject)).not.toContain('стационарному агрегату');
  });

  it('согласует названия и количество на главной и в меню', () => {
    const home = page('');
    expect(home('[data-kartochka] a[href$="/catalog/hydrant/"] [data-kolichestvo]').text()).toContain('3 направления');
    expect(home('body').text()).not.toMatch(/Пантографы, колодцы, клапаны/i);
  });
});
