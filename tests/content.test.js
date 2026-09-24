import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { sayt, kategorii, otrasli, fotoProizvodstva, menyu, futer } from '../src/lib/content.js';

describe('содержание', () => {
  it('десять категорий, как на главной эталона', () => {
    expect(kategorii).toHaveLength(10);
  });

  it('названия и количества совпадают с эталоном дословно', () => {
    const filtry = kategorii.find((k) => k.klyuch === 'filters');
    expect(filtry.nazvanie).toBe('Фильтры топливные, фильтры жидкостные');
    expect(filtry.kolichestvo).toBe('3 товара');
    expect(filtry.korotko).toBe('Фильтры');
  });

  it('плашка «Собственное производство» стоит там, где в эталоне', () => {
    const nesvoi = kategorii.filter((k) => !k.svoye).map((k) => k.klyuch).sort();
    expect(nesvoi).toEqual(['caddy', 'ground', 'pit']);
  });

  it('у каждой категории указана существующая картинка', () => {
    for (const k of kategorii) {
      expect(existsSync(`public${k.kartinka}`), `нет файла ${k.kartinka} у ${k.klyuch}`).toBe(true);
    }
  });

  it('логотип либо есть файлом, либо честно помечен отсутствующим', () => {
    if (sayt.logotip === null) {
      expect(sayt.logotip_kommentariy, 'отсутствие логотипа должно быть объяснено').toBeTruthy();
      expect(sayt.nazvanie.length).toBeGreaterThan(0);
    } else {
      expect(existsSync(`public${sayt.logotip}`), `нет файла логотипа ${sayt.logotip}`).toBe(true);
    }
  });

  it('контакты лежат в одном месте и совпадают с футером эталона', () => {
    expect(sayt.nazvanie).toBe('TAUBER');
    expect(sayt.telefon).toBe('+7 (495) 617-00-04');
    expect(sayt.pochta).toBe('info@tauber.ru');
  });

  it('четыре отрасли с названиями из эталона', () => {
    expect(otrasli).toHaveLength(4);
    expect(otrasli.map((o) => o.nazvanie)).toEqual([
      'Аэропорты',
      'Нефтебазы и терминалы',
      'Склады ГСМ',
      'Промышленные объекты',
    ]);
  });

  it('у каждой отрасли есть категории, и все они существуют', () => {
    const klyuchi = new Set(kategorii.map((k) => k.klyuch));
    for (const o of otrasli) {
      expect(o.kategorii.length).toBeGreaterThan(0);
      for (const k of o.kategorii) {
        expect(klyuchi.has(k), `отрасль «${o.nazvanie}» ссылается на несуществующую категорию ${k}`).toBe(true);
      }
    }
  });

  it('каждый пункт подменю ведёт на существующую категорию', () => {
    // два списка категорий — в меню и в каталоге — иначе расходятся молча
    const klyuchi = new Set(kategorii.map((k) => k.klyuch));
    const adresa = menyu.flatMap((p) => (p.kolonki ?? []).flatMap((k) => k.punkty.map((x) => x.adres)));
    expect(adresa.length).toBe(kategorii.length);
    for (const adres of adresa) {
      const klyuch = adres.replace(/^\/catalog\/|\/$/g, '');
      expect(klyuchi.has(klyuch), `подменю ведёт на несуществующую категорию: ${adres}`).toBe(true);
    }
  });

  it('все категории каталога попали в подменю — иначе часть товаров недостижима из меню', () => {
    const vMenyu = new Set(menyu.flatMap((p) => (p.kolonki ?? []).flatMap((k) => k.punkty.map((x) => x.adres.replace(/^\/catalog\/|\/$/g, '')))));
    for (const k of kategorii) {
      expect(vMenyu.has(k.klyuch), `категории «${k.nazvanie}» нет в подменю`).toBe(true);
    }
  });

  it('разделы и правовые подписи футера лежат в содержании, а не в вёрстке', () => {
    expect(futer.razdely.length).toBeGreaterThan(0);
    expect(futer.politika).toBeTruthy();
    expect(futer.opisanie).toBeTruthy();
  });

  it('четыре фотографии производства с подписями и существующими файлами', () => {
    expect(fotoProizvodstva).toHaveLength(4);
    for (const f of fotoProizvodstva) {
      expect(f.podpis.length).toBeGreaterThan(0);
      expect(existsSync(`public${f.fayl}`), `нет файла ${f.fayl}`).toBe(true);
    }
  });
});
