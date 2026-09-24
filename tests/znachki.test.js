import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { load } from 'cheerio';
import { menyu, otrasli } from '../src/lib/content.js';

// имена значков Material Symbols, которые используются в вёрстке и содержании.
// Опечатка в имени не ломает сборку — вместо значка посетитель видит английское слово,
// поэтому список проверяется явно.
const DOPUSTIMYE = new Set([
  'arrow_forward', 'arrow_back', 'arrow_downward', 'arrow_outward', 'expand_more',
  'call', 'mail', 'search',
  'filter_alt', 'deployed_code', 'science',
  'flight', 'local_gas_station', 'input', 'trolley',
  'plumbing', 'oil_barrel', 'precision_manufacturing',
  'propane_tank', 'factory',
]);

describe('значки', () => {
  it('в содержании нет имён значков с опечатками', () => {
    const izSoderzhaniya = [
      ...menyu.flatMap((p) => (p.kolonki ?? []).flatMap((k) => k.punkty.map((x) => x.znachok))),
      ...otrasli.map((o) => o.znachok),
    ];
    expect(izSoderzhaniya.length).toBeGreaterThan(0);
    for (const z of izSoderzhaniya) {
      expect(DOPUSTIMYE.has(z), `значок «${z}» не из списка — вместо него посетитель увидит это слово`).toBe(true);
    }
  });

  it('в вёрстке нет значков с опечатками', () => {
    const $ = load(readFileSync('dist/index.html', 'utf8'));
    const izVyorstki = $('.ms').map((_, e) => $(e).text().trim()).get().filter(Boolean);
    expect(izVyorstki.length).toBeGreaterThan(0);
    for (const z of izVyorstki) {
      expect(DOPUSTIMYE.has(z), `значок «${z}» не из списка`).toBe(true);
    }
  });

  it('шрифт значков не разрастается незаметно', () => {
    const razmer = statSync('src/assets/fonts/MaterialSymbolsOutlined-200.woff2').size;
    // 351 КБ ради двадцати значков — много; проверка держит планку и ловит рост
    expect(razmer).toBeLessThan(400 * 1024);
  });
});
