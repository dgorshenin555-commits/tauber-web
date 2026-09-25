import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
const page = (key) => load(readFileSync(`dist/catalog/${key}/index.html`, 'utf8'));
describe('содержание свежего эталона Vellum', () => {
  it('показывает исполнения кабельных накопителей, которые раньше терялись', () => {
    const $ = page('cable');
    expect($('body').text()).toContain('Кабельные накопители для 400 Гц');
    expect($('img[src$="/cab-1.png"]').length).toBe(1);
  });
  it('показывает массу и габариты обоих кэдди, а не только заголовок секции', () => {
    const text = page('cdm')('body').text();
    for (const value of ['Ручной кэдди 1D', 'Ручной кэдди 2D', 'около 400 кг', 'около 550 кг', '1775 × 1430 × 1375 мм']) expect(text).toContain(value);
  });
  it('сохраняет значения характеристик ФТВ', () => {
    const text = page('ftv')('[data-fakt]').text();
    for (const value of ['от −60 до +50 °C', '≤ 15 мкм', '0.3 – 1.6 МПа', 'до 20 лет']) expect(text).toContain(value);
  });
  it('типоразмеры PA/PE представлены таблицей из восьми строк', () => {
    const $ = page('pape');
    expect($('table tbody tr').length).toBe(8);
    expect($('table').text()).toContain('Усиленное');
    expect($('table').text()).toContain('630');
  });
});
