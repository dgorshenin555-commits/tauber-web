// ── Замечания «Денис 2»: видимый текст и переходы ────────────────
// Проверяем собранные страницы, чтобы единый шаблон работал для всех АФТ.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

const katalog = JSON.parse(readFileSync('content/catalog/fmod.json', 'utf8'));
const page = (key) => load(readFileSync(`dist/catalog/${key}/index.html`, 'utf8'));

describe('замечания Денис 2', () => {
  it('объясняет десять направлений десятью пунктами', () => {
    const $ = page('fmod');
    expect($('[data-napravleniya] li')).toHaveLength(10);
    expect($('[data-kartochka-razdela]')).toHaveLength(10);
  });

  it('показывает согласованные названия разделов в каталоге и меню', () => {
    const $ = load(readFileSync('dist/index.html', 'utf8'));
    const tekst = $('body').text();
    for (const nazvanie of [
      'Устройства слива-налива',
      'Сливо-наливные эстакады и комплексы',
      'Система визуального контроля топлива (СВКТ)',
    ]) expect(tekst).toContain(nazvanie);
  });

  it('даёт перейти между всеми агрегатами и открыть нормативы в новой вкладке', () => {
    for (const c of katalog.kartochki) {
      const $ = page(c.vedyot_na);
      expect($('main').text()).not.toMatch(/стационар|подготовк[аи] потока|перед поступлением/i);
      expect($('.aft-hero .aft-button').text()).toContain('Отправить заявку на расчёт');
      const cards = $('[data-aft-drugie] a');
      expect(cards).toHaveLength(9);
      expect(cards.map((_, a) => $(a).attr('href')).get()).not.toContain(`/tauber-web/catalog/${c.vedyot_na}/`);
      $('#aft-dokumenty a[href^="https://"]').each((_, a) => {
        expect($(a).attr('target')).toBe('_blank');
        expect($(a).attr('rel')).toContain('noopener');
        expect($(a).attr('href')).not.toContain('protect.gost.ru');
      });
    }
  });
});
