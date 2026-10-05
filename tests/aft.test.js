// ── Приёмка нового раздела АФТ ───────────────────────────────────────
// Проверяем публичную структуру и опасные смысловые подмены, а не копию вёрстки.
// Связи: content/catalog/fmod.json → товарные JSON → dist/catalog/*.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';

const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const kategoriya = json('content/catalog/fmod.json');
const page = (key) => load(readFileSync(`dist/catalog/${key}/index.html`, 'utf8'));
const risunki = ['Б.1', 'Б.2', 'Б.3', 'Б.4', 'Б.5', 'Б.6', 'Б.9', 'Б.10', 'Б.11', 'Б.12'];

// ── Охват операций и отдельные жидкости ──────────────────────────────
describe('стационарные решения АФТ', () => {
  it('охватывает десять стационарных схем, включая ПВКЖ, возврат и смеси', () => {
    expect(kategoriya.zagolovok).toBe('Агрегаты фильтрации топлива (АФТ)');
    expect(kategoriya.kartochki).toHaveLength(10);
    const normativy = kategoriya.kartochki.map((c) => json(`content/tovary/${c.vedyot_na}.json`).normativ.risunok);
    expect(normativy).toEqual(risunki);
  });

  it('для каждого решения есть описание, схема операции, фото и рендер', () => {
    for (const c of kategoriya.kartochki) {
      expect(c.opisanie.length).toBeGreaterThan(40);
      const $ = page(c.vedyot_na);
      expect($('[data-tekhnologicheskaya-skhema] li').length).toBeGreaterThanOrEqual(3);
      expect($('[data-media-placeholder="foto"]').length).toBeGreaterThan(0);
      expect($('[data-media-placeholder="render"]').length).toBeGreaterThan(0);
      expect($('a[href="/tauber-web/catalog/fmod/"]').length).toBeGreaterThan(0);
      expect($('[data-forma-podbora] textarea').length).toBeGreaterThan(0);
      expect($('main').text()).not.toMatch(/АФТ-С|АФТ-П|компоновоч|Smith Meter|___/i);
    }
  });

  it('возврат топлива требует проверки качества, ПВКЖ имеет свои параметры', () => {
    const vozvrat = page('aft-vozvrat')('main').text();
    expect(vozvrat).toContain('после проверки качества');
    const pvkzh = page('aft-pvkzh');
    expect(pvkzh('main').text()).toContain('Приём, хранение и выдача ПВКЖ');
    expect(pvkzh('[data-forma-podbora]').text()).toContain('Марка ПВКЖ');
    expect(pvkzh('[data-forma-podbora]').text()).not.toContain('Марка авиатоплива');
  });

  it('техническая комплектация отделяет проектные варианты от состава схемы, документация не скачивается', () => {
    for (const c of kategoriya.kartochki) {
      const $ = page(c.vedyot_na);
      expect($('h2').text()).toContain('Технические характеристики и комплектация');
      expect($('[data-gruppa-komplektacii="skhema"]').length).toBe(1);
      expect($('[data-gruppa-komplektacii="varianty"]').text()).toContain('Массовый или объёмный учёт');
      expect($('main a[download], main a[href$=".pdf"], main a[href$=".doc"], main a[href$=".docx"]').length).toBe(0);
      expect($('main').text()).toContain('Перечень документации поставки');
    }
  });

  // ── Достижимость и удаление устаревшего содержания ──────────────────
  it('все карточки ведут на наполненные страницы с нормативным источником', () => {
    const $ = page('fmod');
    expect($('[data-kartochka-razdela]').length).toBe(10);
    for (const c of kategoriya.kartochki) {
      const key = c.vedyot_na;
      expect(existsSync(`dist/catalog/${key}/index.html`)).toBe(true);
      expect($(`a[href="/tauber-web/catalog/${key}/"]`).length).toBe(1);
      const product = page(key);
      expect(product('main').text()).toContain(`Рисунок ${json(`content/tovary/${key}.json`).normativ.risunok}`);
      expect(product('main a[href^="https://protect.gost.ru/"]').length).toBeGreaterThan(0);
    }
  });

  it('старое название исчезло, старый товар перенаправлен в актуальный раздел', () => {
    expect(page('fmod')('body').text()).not.toContain('Фильтрационные модули');
    expect(page('fmk')('meta[http-equiv="refresh"]').attr('content')).toContain('/tauber-web/catalog/fmod/');
    expect(page('fmk')('body').text()).not.toContain('эмульгированной воды');
    const $ = load(readFileSync('dist/index.html', 'utf8'));
    expect($('[data-kartochka] a[href="/tauber-web/catalog/fmod/"]').text()).toContain('Агрегаты фильтрации топлива');
    expect($('#mobilnoe-menyu').text()).toContain('Агрегаты фильтрации топлива');
  });
});
