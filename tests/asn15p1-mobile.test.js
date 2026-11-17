import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { load } from 'cheerio';

const pagePath = 'dist/catalog/asn-15p1-mobile/index.html';

describe('мобильная измерительная система АСН-15П1', () => {
  it('публикуется как самостоятельная техническая страница TAUBER', () => {
    expect(existsSync(pagePath)).toBe(true);

    const html = readFileSync(pagePath, 'utf8');
    const $ = load(html);
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    expect($('h1').text().replace(/\s+/g, ' ').trim()).toBe('Мобильная измерительная система АСН-15П1');
    expect($('[data-media-placeholder="foto"]')).toHaveLength(1);
    expect(text).toContain('15–70 м³/ч');
    expect(text).toContain('±0,25%');
    expect(text).toContain('DN 80');
    expect(text).toContain('RS-485');
    expect(text).toContain('Modbus RTU');
    expect($('[data-podbor]')).toHaveLength(1);
    expect($('[data-podbor] [data-otpravit]')).toHaveLength(1);
    expect(html).not.toContain('Промприбор');
    expect(html).not.toContain('prompribor-pk.ru');
    expect($('img[src*="prompribor"]')).toHaveLength(0);
  });
});
