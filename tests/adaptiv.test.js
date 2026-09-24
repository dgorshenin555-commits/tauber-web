import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

let css;
beforeAll(() => {
  css = readdirSync('dist/_astro')
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8'))
    .join('\n');
});

describe('адаптивность', () => {
  it('описаны все контрольные точки', () => {
    for (const tochka of ['1280px', '1024px', '768px', '480px']) {
      expect(css, `нет медиазапроса для ${tochka}`).toContain(tochka);
    }
  });

  it('нет фиксированной ширины макета — она вызывает горизонтальную прокрутку', () => {
    expect(css).not.toMatch(/width:\s*1600px/);
  });

  it('изображения не выходят за пределы контейнера', () => {
    expect(css).toMatch(/img[^{]*\{[^}]*max-width:\s*100%/);
  });

  it('страница не прокручивается по горизонтали', () => {
    expect(css).toMatch(/overflow-x:\s*hidden/);
  });

  it('боковое поле не прижимает текст к краю на узком экране', () => {
    expect(css).toMatch(/--pole-bok:\s*max\(\s*16px/);
  });

  it('сетка категорий перестраивается на узких экранах', () => {
    const perestroyki = css.match(/grid-template-columns:\s*repeat\((\d)/g) ?? [];
    const kolonki = new Set(perestroyki.map((m) => m.match(/\((\d)/)[1]));
    expect(kolonki.size, 'сетка должна иметь несколько раскладок').toBeGreaterThan(2);
  });

  it('ни один блок не требует больше 360 пикселей ширины — иначе телефон уедет в прокрутку', () => {
    const minWidths = [...css.matchAll(/min-width:\s*(\d+)px/g)]
      .map((m) => Number(m[1]))
      .filter((n) => n > 0);
    for (const w of minWidths) {
      expect(w, `min-width: ${w}px шире узкого экрана`).toBeLessThanOrEqual(360);
    }
  });

  it('герой складывается в одну колонку на планшете', () => {
    expect(css).toMatch(/grid-template-columns:\s*1fr/);
  });
});
