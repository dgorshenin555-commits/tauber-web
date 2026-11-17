import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { load } from 'cheerio';

const pagePath = 'dist/catalog/asn-15p1-mobile/index.html';

describe('мобильная измерительная система АСН-15П1', () => {
  it('публикуется как самостоятельная техническая страница TAUBER', () => {
    expect(existsSync(pagePath)).toBe(true);
    expect(existsSync('dist/images/asn-15p1-mobile-main.jpg')).toBe(true);
    expect(existsSync('dist/images/asn-15p1-mobile-overview.jpg')).toBe(true);

    const html = readFileSync(pagePath, 'utf8');
    const $ = load(html);
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    expect($('h1').text().replace(/\s+/g, ' ').trim()).toBe('Мобильная измерительная система АСН-15П1');
    expect($('[data-media-placeholder="foto"]')).toHaveLength(0);
    expect($('.tovar-verh__kartinka img[src="/tauber-web/images/asn-15p1-mobile-main.jpg"]')).toHaveLength(1);
    expect($('.galereya-tovara--dve img')).toHaveLength(2);
    expect($('.galereya-tovara img[src="/tauber-web/images/asn-15p1-mobile-main.jpg"]')).toHaveLength(1);
    expect($('.galereya-tovara img[src="/tauber-web/images/asn-15p1-mobile-overview.jpg"]')).toHaveLength(1);
    expect(text).toContain('15–70 м³/ч');
    expect(text).toContain('±0,25%');
    expect(text).toContain('погрешности измерения массы при сливе');
    expect(text).toContain('погрешности измерения объёма при сливе');
    expect(text).toContain('Минимальный объём налива');
    expect(text).toContain('600–1200 кг/м³');
    expect(text).toContain('Не более 100 мкм');
    expect(text).toContain('DN 80');
    expect(text).toContain('RS-485');
    expect(text).toContain('Modbus RTU');
    expect($('[data-podbor]')).toHaveLength(1);
    expect($('[data-podbor] [data-otpravit]')).toHaveLength(1);
    expect(html).not.toContain('Промприбор');
    expect(html).not.toContain('prompribor-pk.ru');
    expect($('img[src*="prompribor"]')).toHaveLength(0);
  });

  it('показывает единственную компактную форму сразу после ключевых параметров', () => {
    const $ = load(readFileSync(pagePath, 'utf8'));
    const priorityForm = $('.fakty + [data-podbor-prioritet]');

    expect(priorityForm).toHaveLength(1);
    expect($('[data-podbor]')).toHaveLength(1);
    expect(priorityForm.find('[data-parametr]')).toHaveLength(7);
    expect(priorityForm.nextAll('[data-sekciya]').length).toBeGreaterThan(0);
  });

  it('раскрывает компоновку, дренажную систему и автоматику', () => {
    const $ = load(readFileSync(pagePath, 'utf8'));
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    const compositionSection = $('h2')
      .filter((_, element) => $(element).text().trim() === 'Компоновка и технологические узлы')
      .closest('[data-sekciya]');

    expect(text).toContain('Компоновка и технологические узлы');
    expect(compositionSection.find('.sekciya__vvodnyy-tekst')).toHaveLength(1);
    expect(compositionSection.find('.sekciya__kartochki .reshenie')).toHaveLength(5);
    expect(text).toContain('Приём продукта → фильтрация и газоотделение → массовое измерение → регулирование и отсечка → слив');
    expect(text).toContain('МЛ 80');
    expect(text).toContain('двухступенчат');
    expect(text).toContain('0,1 мм');
    expect(text).toContain('ДУ0');
    expect(text.toLowerCase()).toContain('перепад');
    expect(text).toContain('полностью опорожнить фильтр-газоотделитель и расходомер');
    expect(text).toContain('температурн');
    expect(text).toContain('БУИ');
    expect(text).toContain('БУК');
    expect(text).toContain('пневматическ');
    expect(text).toContain('нержавеющ');
    expect(text).toContain('металлорукав');
  });
});
