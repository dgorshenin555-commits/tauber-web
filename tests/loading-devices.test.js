// ── Приёмка комментариев владельца к устройствам ──────────────────
// Проверяем результат сборки: ассортимент, потоки, границы поставки и документы.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

const keys = ['s1201', 's1201rv', 's1403', 's1405', 's1802', 's1803'];
const page = (key) => load(readFileSync(`dist/catalog/${key}/index.html`, 'utf8'));

describe('устройства слива-налива', () => {
  // ── Ассортимент без снятой серии и с настоящими маршрутами ──────
  it('публикует шесть связанных страниц без 1101 и 1701', () => {
    const $ = page('load');
    expect($('[data-kartochka-razdela]').length).toBe(6);
    const links = $('[data-kartochka-razdela] a').map((_, a) => $(a).attr('href')).get();
    expect(links.sort()).toEqual(keys.map((k) => `/tauber-web/catalog/${k}/`).sort());
    expect($('main').text()).not.toMatch(/1101|1701|Муфты и поворотные узлы|Клапанные блоки|24\/7/);
    for (const key of keys) expect(existsSync(`dist/catalog/${key}/index.html`)).toBe(true);
  });

  it('каждая серия имеет четыре содержательные панели и пять соседних серий', () => {
    for (const key of keys) {
      expect(existsSync(`dist/catalog/${key}/index.html`), key).toBe(true);
      const $ = page(key);
      expect($('[data-device-tab]').length).toBe(4);
      $('[data-device-tab]').each((_, a) => {
        const panel = $($(a).attr('href'));
        expect(panel.length).toBe(1);
        expect(panel.text().trim().length).toBeGreaterThan(100);
        expect(panel.attr('hidden')).toBeUndefined(); // доступно без JS
      });
      expect($('[data-device-related] a').length).toBe(5);
      expect($('main').text()).toContain('70 Н');
      expect($('main').text()).not.toMatch(/DN\s*175|≤7 мин|7 мин|1,6 МПа|40 МПа/);
      expect($('main').text()).not.toMatch(/Пути продукта и паров|Последовательность подключения показана упрощённо/);
      expect($('main a[href$=".pdf"], main a[href$=".doc"], main a[href$=".docx"]').length).toBe(0);
      expect($('a[href^="mailto:"]').length).toBeGreaterThan(0);
      expect($('[data-device-contact]').length).toBe(1);
      const pressure = ['s1201', 's1201rv', 's1405'].includes(key) ? 'до 2,5 МПа' : 'до 4,0 МПа';
      expect($('#device-dannye').text()).toContain(pressure);
      expect($('#device-dannye').text()).toContain('DN80 / DN100');
    }
  });

  // ── Предметные различия не заменяются общей таблицей опций ──────
  it('описание включает рабочие продукты и особенности эксплуатации каждой серии', () => {
    for (const key of keys) {
      const $ = page(key);
      const section = $('#device-opisanie');
      expect(section.find('[data-device-products] h3').text()).toBe('Рабочие продукты');
      expect(section.find('[data-device-products] tbody tr').length).toBeGreaterThanOrEqual(2);
      expect(section.find('[data-device-features] li').length).toBeGreaterThanOrEqual(3);
      expect(section.find('[data-device-products]').text()).toMatch(/материал|уплотнен/);
    }
  });

  it('структурирует описание, среды и соседние устройства', () => {
    for (const key of keys) {
      const $ = page(key);
      expect($('.device-summary > div').length).toBe(3);
      expect($('[data-device-technical] > div').length).toBe(3);
      expect($('[data-device-description-card]').length).toBeGreaterThanOrEqual(2);
      expect($('[data-device-products] table th[scope="col"]').length).toBe(2);
      expect($('[data-device-products] tbody .ms').length).toBe($('[data-device-products] tbody tr').length);
      expect($('[data-device-track] a img').length).toBe(5);
      expect($('[data-device-related] h2').text()).toBe('Другие устройства слива-налива');
      expect($('[data-device-next]').length).toBe(1);
    }
    for (const key of ['s1403', 's1803']) {
      const text = page(key)('#device-opisanie').text();
      expect(text).toMatch(/Автоцистерны и танк-контейнеры/);
      expect(text).not.toMatch(/железнодорожн/);
    }
  });

  it('названия продуктов доступны поиску в видимом содержании, с учётом назначения', () => {
    const terms = {
      s1201: ['нефт', 'масл', 'мазут'], s1201rv: ['нефт', 'растворител'],
      s1403: ['нефт', 'спирт'], s1405: ['бензин', 'дизель'],
      s1802: ['суг', 'аммиак'], s1803: ['суг', 'аммиак'],
    };
    for (const [key, words] of Object.entries(terms)) {
      const text = page(key)('[data-device-products]').text().toLowerCase();
      for (const word of words) expect(text, `${word} на ${key}`).toContain(word);
    }
    expect(page('s1403')('[data-device-products]').text()).not.toMatch(/СУГ|аммиак/);
  });

  it('учитывает уточнения владельца о наливе, пароотводе и парковке', () => {
    const open = page('s1201')('#device-opisanie').text();
    expect(open).toContain('открыт');
    expect(open).not.toMatch(/закрыт|уплотнённ|серная кислота|СУГ|аммиак|растворител|ароматическ|спирт|эфир/i);
    expect(open).not.toContain('по длине и форме');
    const rv = page('s1201rv')('#device-opisanie').text();
    expect(rv).toContain('закрытого');
    expect(rv).not.toMatch(/открыт/i);
    expect(rv).toContain('RV Duplex');
    expect(rv).toContain('гибкий рукав — RV');
    for (const key of keys) {
      const $ = page(key);
      const text = $('#device-opisanie').text();
      expect(text).toContain('Блокиратор парковки');
      expect(text).toContain('концевой выключатель');
      expect(text).toContain('индуктивный датчик магнитного типа');
      expect($('#device-ispolneniya').text()).toContain('Блокиратор парковки');
      if (['s1201rv', 's1405', 's1802', 's1803'].includes(key)) {
        expect($('.device-summary').text()).toContain('DN50 / DN80');
      }
    }
    for (const key of ['s1201', 's1201rv', 's1403', 's1405']) {
      expect(page(key)('[data-device-products]').text()).not.toMatch(/СУГ|аммиак|ДМЭ/);
    }
    for (const key of ['s1802', 's1803']) {
      expect(page(key)('[data-device-products]').text()).not.toMatch(/другие спирты|масла|мазут/i);
    }
  });

  it('разделяет температуру продукта и климат, без особого ограничения API', () => {
    for (const key of keys) {
      const $ = page(key);
      const rows = $('#device-dannye tbody tr');
      const value = (name) => rows.filter((_, row) => $(row).find('th').text() === name).find('td').text();
      expect(value('Температура продукта')).toBe('от −60 до +250 °C — по температурному исполнению');
      expect(value('Температура окружающего воздуха, У')).toBe('от −40 до +50 °C');
      expect(value('Температура окружающего воздуха, ХЛ')).toBe('от −60 до +50 °C');
    }
    expect(page('s1405')('#device-dannye').text()).not.toContain('в зависимости от концевого присоединения');
  });

  it('1403 однолинейная, 1803 на общей стойке, 1405 с отдельным пароотводом', () => {
    expect(page('s1403')('main').text().toLowerCase()).toContain('без отвода паров');
    expect(page('s1803')('main').text()).toContain('на одной стойке');
    expect(page('s1803')('main').text()).toContain('Гибкий');
    expect(page('s1405')('main').text()).toContain('Муфта API');
    expect(page('s1405')('main').text().toLowerCase()).toContain('отдельное устройство');
  });
});
