// ── Согласованные типы фильтров и нормативные пределы ───────────────
// JSON задаёт смысл, собранный HTML должен показывать тонкость рядом с фильтром.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const read = (key) => JSON.parse(readFileSync(`content/tovary/${key}.json`, 'utf8'));
const keys = JSON.parse(readFileSync('content/catalog/fmod.json', 'utf8')).kartochki.map(c => c.vedyot_na);
const filters = (key) => read(key).aft.oborudovanie.filter(r => /^Фильтр/.test(r.nazvanie));

describe('фильтры АФТ', () => {
  it('не дублирует микрофильтр и выводит тонкость у каждого фильтра', () => {
    for (const key of keys) {
      const d = read(key);
      const rows = filters(key);
      expect(rows.length, key).toBeGreaterThan(0);
      expect(d.aft.oborudovanie.some(r => /^Микрофильтр|^Сетчатый фильтр|с заданной тонкостью/.test(r.nazvanie)), key).toBe(false);
      expect(JSON.stringify(d)).not.toMatch(/фильтр-сепаратор/i);
      const mainFine = rows.filter(r => r.nazvanie === 'Фильтр тонкой очистки (микрофильтр)');
      expect(mainFine.length, key).toBeLessThanOrEqual(1);
      const $ = load(readFileSync(`dist/catalog/${key}/index.html`, 'utf8'));
      for (const row of rows) {
        expect(row.tonkost, `${key}: ${row.nazvanie}`).toBeTruthy();
        expect(row.osnovanie).toMatch(/4\.8|6\./);
        const htmlRow = $('[data-aft-table="oborudovanie"] tbody tr').filter((_, tr) => $(tr).find('th').text() === row.nazvanie);
        expect(htmlRow.length).toBe(1);
        expect(htmlRow.find('[data-aft-tonkost]').text()).toContain(row.tonkost);
      }
    }
  });

  it('сохраняет пределы технологических операций вместо произвольного выбора заказчика', () => {
    const expected = {
      'aft-priem-cisterny': [15, 5], 'aft-priem-truboprovod': [15, 5],
      'aft-priem-suda': [15, 5], 'aft-vydacha': [3, 5],
      'aft-czs-dozirovanie': [3], 'aft-czs-bez-vvoda': [3],
      'aft-pvkzh': [15, 5, 3], 'aft-priem-smesi': [15, 5], 'aft-vydacha-smesi': [3],
    };
    for (const [key, limits] of Object.entries(expected)) {
      const active = filters(key).filter(r => /тонкой|водоотделитель/.test(r.nazvanie) && !r.nazvanie.includes('ПВКЖ'));
      const rows = key === 'aft-pvkzh' ? filters(key).filter(r => /тонкой/.test(r.nazvanie)) : active;
      for (const row of rows) for (const limit of limits) expect(row.tonkost, `${key}: ${row.nazvanie}`).toContain(`не более ${limit} мкм`);
    }
  });

  // ── Особые среды и защитные сетки не наследуют чужие нормы ──────
  it('разделяет защиту насоса, смесь, ПВКЖ и возвратные потоки', () => {
    for (const key of keys) for (const r of filters(key).filter(r => /грубой/.test(r.nazvanie))) {
      expect(r.tonkost).toContain('не установлена');
      expect(r.tonkost).not.toMatch(/не более \d+ мкм/);
    }
    for (const key of ['aft-priem-smesi', 'aft-vydacha-smesi']) {
      expect(filters(key).some(r => /водоотделитель/.test(r.nazvanie))).toBe(false);
      expect(filters(key).find(r => /тонкой.*смеси/.test(r.nazvanie)).trebovanie).toMatch(/Два последовательно/);
    }
    expect(filters('aft-vozvrat').find(r => /тонкой/.test(r.nazvanie)).tonkost).toContain('ОНП');
    for (const key of ['aft-vydacha', 'aft-czs-dozirovanie', 'aft-vydacha-smesi']) {
      const pvkzh = filters(key).filter(r => r.nazvanie.includes('ПВКЖ'));
      expect(pvkzh.length, key).toBeGreaterThan(0);
      expect(pvkzh.map(r => r.tonkost).join(' ')).toContain('не более 3 мкм');
    }
  });
});
