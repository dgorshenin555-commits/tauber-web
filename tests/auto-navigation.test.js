import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

describe('карточки сливо-наливных комплексов', () => {
  it('ведут на готовые страницы решений и не подменяют их почтой', () => {
    const $ = load(readFileSync('dist/catalog/auto/index.html', 'utf8'));
    const cards = $('[data-kartochka-razdela]');
    const lowerLoading = cards.filter((_, card) => $(card).find('h3').text() === 'Комплекс нижнего налива');
    const mobileMetering = cards.filter((_, card) => $(card).find('h3').text() === 'Мобильная измерительная система АСН-15П1');

    expect(cards).toHaveLength(7);
    expect($('.verh__chislo').text().trim()).toBe('11');
    expect(cards.find('a[href^="mailto:"]')).toHaveLength(0);
    expect(lowerLoading.find('a')).toHaveLength(0);
    expect(cards.find('a[href="/tauber-web/catalog/ank/"]')).toHaveLength(1);
    expect(mobileMetering.find('a[href="/tauber-web/catalog/asn-15p1-mobile/"]')).toHaveLength(1);
    expect(mobileMetering.find('img[src="/tauber-web/images/asn-15p1-mobile-main.jpg"]')).toHaveLength(1);
  });
});
