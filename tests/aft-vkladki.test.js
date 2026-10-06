// ── Приёмка замечаний Дениса ───────────────────────────────────────
// Проверяем доступную навигацию, предметный состав и отсутствие закрытых файлов.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const katalog = JSON.parse(readFileSync('content/catalog/fmod.json', 'utf8'));
const page = (key) => load(readFileSync(`dist/catalog/${key}/index.html`, 'utf8'));

describe('вкладки страниц АФТ', () => {
  it('каждое направление имеет четыре связанные вкладки и панели', () => {
    for (const c of katalog.kartochki) {
      const $ = page(c.vedyot_na);
      const tabs = $('[data-aft-tab]');
      expect(tabs.length).toBe(4);
      tabs.each((_, tab) => {
        const href = $(tab).attr('href');
        expect($(href).length).toBe(1);
        expect($(href).text().trim().length).toBeGreaterThan(60);
      });
      expect($('[data-fakt]').length).toBe(0);
      expect($('main').text()).not.toMatch(/Технологическая задача по ГОСТ|без размеров и конструктивных|резервуарной схемой объекта/);
    }
  });

  it('механическое оборудование и КИП приведены в отдельных таблицах с основаниями', () => {
    for (const c of katalog.kartochki) {
      const $ = page(c.vedyot_na);
      for (const kind of ['oborudovanie', 'kip']) {
        const table = $(`[data-aft-table="${kind}"]`);
        expect(table.find('tbody tr').length).toBeGreaterThan(2);
        table.find('tbody tr').each((_, tr) => expect($(tr).find('td').last().text()).toMatch(/[456]\.|Б\./));
      }
      expect($('[data-aft-table="oborudovanie"]').text()).not.toMatch(/Защитный фильтр|; фильтр;/);
      expect($('#aft-dokumenty').text()).toContain('Стандартный обязательный комплект');
      expect($('main a[download], main a[href$=".docx"], main a[href$=".pdf"]').length).toBe(0);
    }
  });
});
