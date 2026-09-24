import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { sayt } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('панель «Есть задача?»', () => {
  it('присутствует на главной — это единственный призыв к действию', () => {
    const panel = $('[data-panel-zadacha]');
    expect(panel.length).toBe(1);
    expect(panel.text()).toContain('Есть задача?');
    expect(panel.text()).toContain('Обсудим ваш проект');
  });

  it('даёт связаться: телефон, почта и кнопка заявки', () => {
    const panel = $('[data-panel-zadacha]');
    expect(panel.find('a[href^="tel:"]').length).toBe(1);
    expect(panel.find('a[href^="mailto:"]').length).toBeGreaterThanOrEqual(1);
    expect(panel.text()).toContain(sayt.telefon);
  });

  it('использует тёмный токен из эталона, который иначе остался бы неиспользованным', () => {
    const src = readFileSync('src/components/PanelZadacha.astro', 'utf8');
    expect(src).toContain('var(--temnaya)');
  });
});
