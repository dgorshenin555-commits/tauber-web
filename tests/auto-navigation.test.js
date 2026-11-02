import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

describe('карточки сливо-наливных комплексов', () => {
  it('не открывают почту вместо отсутствующей страницы решения', () => {
    const $ = load(readFileSync('dist/catalog/auto/index.html', 'utf8'));
    const cards = $('[data-kartochka-razdela]');
    const lowerLoading = cards.filter((_, card) => $(card).find('h3').text() === 'Комплекс нижнего налива');

    expect(cards).toHaveLength(6);
    expect(cards.find('a[href^="mailto:"]')).toHaveLength(0);
    expect(lowerLoading.find('a')).toHaveLength(0);
    expect(cards.find('a[href="/tauber-web/catalog/ank/"]')).toHaveLength(1);
  });
});
