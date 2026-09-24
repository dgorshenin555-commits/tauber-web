# Каркас сайта Таубер и публикация — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать каркас сайта Таубер на Astro — шапка, футер, мобильное меню, главная страница-каталог — и опубликовать его по постоянной ссылке, чтобы дальше обсуждать разделы, глядя на живой сайт.

**Architecture:** Статическая сборка Astro. Оформление задаётся CSS-переменными в одном файле токенов; вёрстка разложена на компоненты, повторяющие блоки эталона; всё содержание вынесено в `content/` отдельными JSON-файлами. Интерактив — минимальный ванильный JavaScript в островах, без фреймворков. Публикация на Cloudflare Pages: постоянный адрес для `main` плюс отдельная ссылка на каждый pull request.

**Tech Stack:** Astro 5, Vitest + Cheerio для проверок собранного HTML, локальные шрифты woff2, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-24-tauber-web-design.md`

## Global Constraints

- Эталон — `design/Tauber.dc.html`. Файлы в `design/` не изменяются никогда: это архив.
- Вывод сборки строго статический: `output: 'static'`. Серверный рантайм не подключается.
- Шрифты только локальные, из `design/fonts/`. Обращений к `fonts.googleapis.com` в собранном HTML быть не должно.
- Палитра, дословно из эталона: фон `#E9EFEB`, панель шапки `#EDF2EE`, подложка героя `#DEE8E1`, оранжевый акцент `#F5761B`, тёмная панель `#1C1F21`, футер `#16191C`, текст футера `#C9CFCB`, основной текст `#101214`, второстепенный текст `#3B4247`, приглушённый `#5C6560`, красный при наведении `#E31E24`.
- Шрифт `Golos Text`, иконки `Material Symbols Outlined`.
- Из вариантов главной переносится только утверждённое: каталог «5 × 2» — это ветка `catsGrid` эталона, 5 карточек в ряд, 10 штук всего; отрасли «Крупный шрифт» — ветка `indType`. Ветки `catsSplit`, `indCards`, `indRows`, `indDark`, `indTabs` не переносятся.
- Содержание только в `content/`, вёрстка и оформление только в `src/`. Текст, вписанный прямо в компонент, — ошибка, кроме подписей интерфейса вроде «Скачать каталог».
- Все тексты переносятся из эталона дословно, включая знаки препинания и неразрывные пробелы.
- Вёрстка работает от ширины 360 пикселей. Горизонтальной прокрутки страницы не возникает ни на одной ширине.
- Галерея производства перелистывается с интервалом 5000 миллисекунд — как в эталоне (`restartTimer`, строка 3273).
- Каждая задача заканчивается коммитом. Работа идёт в ветке, `main` обновляется только через pull request.

## Review Focus

1. **Телефон.** Эталон нарисован под фиксированные 1600 пикселей. При переносе сеток `grid-template-columns` с процентами легко получить страницу, которая на 360 пикселях уезжает в горизонтальную прокрутку. Проверяется в задаче 9.
2. **Кириллица в шрифтах.** Golos Text в бандле разбит на четыре файла по `unicode-range`. Если подключить не все, часть русского текста молча уедет на системный шрифт — заметно по другой форме букв. Проверяется в задаче 1.
3. **Несуществующие изображения.** 32 файла лежат в `design/unnamed/` без осмысленных имён. Если карточка сошлётся на отсутствующий файл, посетитель увидит пустое место вместо фотографии, а сборка при этом пройдёт успешно. Проверяется в задаче 7.
4. **Выпадающее меню с клавиатуры и на тач-экране.** В эталоне подменю открывается по наведению мыши. На телефоне наведения не существует, а с клавиатуры до пунктов подменю не добраться — часть каталога станет недостижимой. Проверяется в задачах 3 и 4.
5. **Таймер галереи.** Фотографии производства перелистываются сами. Если таймер не остановить при уходе со страницы или при скрытии вкладки, он продолжит работать и будет расходовать ресурсы. Проверяется в задаче 6.

---

### Task 1: Проект Astro, токены оформления и шрифты

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`
- Create: `src/styles/tokens.css`
- Create: `src/styles/base.css`
- Create: `public/fonts/` — копии пяти файлов из `design/fonts/`
- Create: `src/layouts/Base.astro`
- Create: `src/pages/index.astro` — временная заглушка, чтобы сборка дала результат
- Test: `tests/karkas.test.js`
- Create: `vitest.config.js`

**Interfaces:**
- Consumes: ничего, это первая задача.
- Produces: CSS-переменные `--fon`, `--fon-shapka`, `--fon-gero`, `--akcent`, `--temnaya`, `--futer`, `--futer-tekst`, `--tekst`, `--tekst-vtoroy`, `--tekst-tihiy`, `--navedenie`; семейство шрифта через `--shrift`; лейаут `Base.astro` с пропсами `{ title: string, description?: string }`.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/karkas.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';

let html, css;

beforeAll(() => {
  html = readFileSync('dist/index.html', 'utf8');
  const cssFile = readdirSync('dist/_astro').find((f) => f.endsWith('.css'));
  css = readFileSync(`dist/_astro/${cssFile}`, 'utf8');
});

describe('каркас', () => {
  it('страница на русском языке', () => {
    expect(load(html)('html').attr('lang')).toBe('ru');
  });

  it('шрифты подключены локально, без Google Fonts', () => {
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });

  it('подключены все четыре файла Golos Text — иначе часть кириллицы уедет на системный шрифт', () => {
    const podklyucheno = css.match(/GolosText-400[^)"']*\.woff2/g) ?? [];
    expect(new Set(podklyucheno).size).toBe(4);
  });

  it('все файлы шрифтов из эталона лежат в сборке', () => {
    const vDizayne = readdirSync('design/fonts').filter((f) => f.endsWith('.woff2'));
    const vSborke = readdirSync('dist/fonts').filter((f) => f.endsWith('.woff2'));
    expect(vSborke.sort()).toEqual(vDizayne.sort());
  });

  it('токены палитры заданы значениями из эталона', () => {
    expect(css).toContain('#E9EFEB');
    expect(css).toContain('#F5761B');
    expect(css).toContain('#101214');
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npx vitest run tests/karkas.test.js`
Ожидается: FAIL — `dist/index.html` не существует, проект ещё не создан.

- [ ] **Step 3: Создать проект**

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --skip-houston --typescript strict
npm install
npm install -D vitest cheerio
cp design/fonts/*.woff2 public/fonts/
```

`astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://tauber-web.pages.dev',
  build: { inlineStylesheets: 'never' },
});
```

`vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/**/*.test.js'], globals: false },
});
```

- [ ] **Step 4: Написать токены и подключить шрифты**

`src/styles/tokens.css` — значения скопированы из эталона, менять нельзя:

```css
:root {
  --fon: #E9EFEB;
  --fon-shapka: #EDF2EE;
  --fon-gero: #DEE8E1;
  --akcent: #F5761B;
  --temnaya: #1C1F21;
  --futer: #16191C;
  --futer-tekst: #C9CFCB;
  --tekst: #101214;
  --tekst-vtoroy: #3B4247;
  --tekst-tihiy: #5C6560;
  --navedenie: #E31E24;

  --shrift: 'Golos Text', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;

  --pole-bok: 2.6%;
  --radius-karta: 28px;
  --radius-pilyulya: 999px;
}
```

`src/styles/base.css` — четыре блока `@font-face` для Golos Text с теми же `unicode-range`, что в эталоне (взять из `design/Tauber.dc.html`, блок `@font-face` в начале файла), плюс один для Material Symbols:

```css
@font-face {
  font-family: 'Golos Text';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/GolosText-400.woff2') format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* ещё три блока: GolosText-400-1.woff2, -2, -3 — с их unicode-range из эталона */

@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 200;
  font-display: block;
  src: url('/fonts/MaterialSymbolsOutlined-200.woff2') format('woff2');
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

body {
  background: var(--fon);
  font-family: var(--shrift);
  color: var(--tekst);
  -webkit-font-smoothing: antialiased;
  text-wrap: pretty;
}

a { color: var(--tekst); text-decoration: none; }
a:hover { color: var(--navedenie); }

.ms {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  direction: ltr;
}
```

`src/layouts/Base.astro`:

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/pages/index.astro` — пока заглушка:

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="Таубер — собственное производство">
  <h1>Каркас</h1>
</Base>
```

- [ ] **Step 5: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/karkas.test.js`
Ожидается: PASS, все пять проверок.

Если проверка про четыре файла Golos Text падает — значит в `base.css` описаны не все `@font-face`. Добавить недостающие, взяв `unicode-range` из эталона.

- [ ] **Step 6: Зафиксировать**

```bash
git switch -c karkas-astro
git add -A
git commit -m "Каркас: проект Astro, токены оформления, локальные шрифты"
```

---

### Task 2: Данные каркаса — контакты, меню, категории

**Files:**
- Create: `content/site.json`
- Create: `content/catalog/categories.json`
- Create: `content/home/industries.json`
- Create: `content/home/factory-photos.json`
- Create: `src/lib/content.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: ничего из кода задачи 1.
- Produces: `src/lib/content.js` экспортирует `sayt`, `kategorii`, `otrasli`, `fotoProizvodstva` — уже разобранные объекты; `kategorii` — массив из 10 элементов вида `{ klyuch, nazvanie, korotko, kolichestvo, kartinka, svoye }`.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/content.test.js
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { sayt, kategorii, otrasli, fotoProizvodstva } from '../src/lib/content.js';

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

  it('контакты лежат в одном месте и заполнены', () => {
    expect(sayt.telefon).toMatch(/\d/);
    expect(sayt.nazvanie).toBe('Таубер');
  });

  it('отрасли и фотографии производства не пусты', () => {
    expect(otrasli.length).toBeGreaterThan(0);
    expect(fotoProizvodstva.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npx vitest run tests/content.test.js`
Ожидается: FAIL — модуль `src/lib/content.js` не найден.

- [ ] **Step 3: Перенести изображения каркаса**

Нужные для главной файлы лежат в `design/assets-web/`. Скопировать в `public/images/`:

```bash
mkdir -p public/images
cp design/assets-web/logo2.webp public/images/
cp design/assets-web/cat-c1.webp design/assets-web/cat-c2.webp design/assets-web/cat-c3.webp public/images/
cp design/assets-web/cat-c4.webp design/assets-web/cat-c5.webp design/assets-web/cat-c6.webp public/images/
cp design/assets-web/auto-hero.webp design/assets-web/probe-hero.webp public/images/
cp design/assets-web/pit-hero.webp design/assets-web/caddy-hero.webp public/images/
```

Фотографии производства (в эталоне — свойство `photos`, строка 3266; в бандле они уже переведены в WebP):

```bash
cp design/assets-web/about-filter-sm.webp design/assets-web/about-skids-sm.webp public/images/
cp design/assets-web/about-steel-sm.webp design/assets-web/about-pipes-sm.webp public/images/
```

- [ ] **Step 4: Создать файлы содержания**

`content/catalog/categories.json` — данные взяты из констант `MAIN`, `EXTRA`, `NOT_OWN`, `SHORT` эталона (строки около 2802–2830). Первые шесть — основные, последние четыре — дополнительные; порядок сохраняется, он определяет порядок карточек:

```json
[
  { "klyuch": "filters",   "nazvanie": "Фильтры топливные, фильтры жидкостные", "korotko": "Фильтры",                "kolichestvo": "3 товара",   "kartinka": "/images/cat-c1.webp",     "svoye": true },
  { "klyuch": "pipelines", "nazvanie": "Трубопроводы с внутренним покрытием",   "korotko": "Трубопроводы",           "kolichestvo": "1 товар",    "kartinka": "/images/cat-c2.webp",     "svoye": true },
  { "klyuch": "ground",    "nazvanie": "Обслуживание самолёта на стоянке",      "korotko": "Обслуживание на стоянке","kolichestvo": "5 товаров",  "kartinka": "/images/cat-c3.webp",     "svoye": false },
  { "klyuch": "hydrant",   "nazvanie": "Гидрантная система",                   "korotko": "Гидрантная система",     "kolichestvo": "5 товаров",  "kartinka": "/images/cat-c4.webp",     "svoye": true },
  { "klyuch": "fmod",      "nazvanie": "Фильтрационные модули",                "korotko": "Фильтрационные модули",  "kolichestvo": "6 товаров",  "kartinka": "/images/cat-c5.webp",     "svoye": true },
  { "klyuch": "load",      "nazvanie": "Слив/налив",                           "korotko": "Слив/налив",             "kolichestvo": "7 товаров",  "kartinka": "/images/cat-c6.webp",     "svoye": true },
  { "klyuch": "auto",      "nazvanie": "Автоматизированные наливные комплексы","korotko": "Наливные комплексы",     "kolichestvo": "10 товаров", "kartinka": "/images/auto-hero.webp",  "svoye": true },
  { "klyuch": "probe",     "nazvanie": "Пробоотборники",                       "korotko": "Пробоотборники",         "kolichestvo": "1 товар",    "kartinka": "/images/probe-hero.webp", "svoye": true },
  { "klyuch": "pit",       "nazvanie": "ПИТ-системы",                          "korotko": "ПИТ-системы",            "kolichestvo": "3 товара",   "kartinka": "/images/pit-hero.webp",   "svoye": false },
  { "klyuch": "caddy",     "nazvanie": "Кэдди",                                "korotko": "Кэдди",                  "kolichestvo": "2 товара",   "kartinka": "/images/caddy-hero.webp", "svoye": false }
]
```

`content/site.json` — контакты и подписи, которые повторяются на всех страницах. Телефон, адрес и почту взять из футера эталона (строки 2466–2497); если там их нет, поставить заглушку `"уточняется"` и внести в открытые вопросы спецификации:

```json
{
  "nazvanie": "Таубер",
  "logotip": "/images/logo2.webp",
  "telefon": "",
  "pochta": "",
  "adres": "",
  "opisanie": "Проектируем и изготавливаем оборудование для топливной, гидравлической и энергетической инфраструктуры."
}
```

`content/home/industries.json` — четыре отрасли, дословно из метода `indVals` эталона (строка 3115). `znachok` — имя иконки Material Symbols, `glavnaya` — категория, на которую ведёт сама отрасль:

```json
[
  {
    "znachok": "flight",
    "nazvanie": "Аэропорты",
    "opisanie": "Заправка, электропитание и кондиционирование воздушных судов на стоянке",
    "glavnaya": "ground",
    "kategorii": ["ground", "hydrant", "pit", "caddy"]
  },
  {
    "znachok": "propane_tank",
    "nazvanie": "Нефтебазы и терминалы",
    "opisanie": "Слив и налив, автоматизированные наливные комплексы",
    "glavnaya": "load",
    "kategorii": ["load", "auto", "probe"]
  },
  {
    "znachok": "local_gas_station",
    "nazvanie": "Склады ГСМ",
    "opisanie": "Фильтрация, учёт и контроль качества топлива",
    "glavnaya": "fmod",
    "kategorii": ["fmod", "filters", "probe"]
  },
  {
    "znachok": "factory",
    "nazvanie": "Промышленные объекты",
    "opisanie": "Трубопроводы, фильтрация и пробоотбор",
    "glavnaya": "pipelines",
    "kategorii": ["pipelines", "filters", "load"]
  }
]
```

Номер отрасли («01», «02», …) и подпись «N направления каталога» в вёрстке считаются из порядка и длины `kategorii`, в содержании их дублировать не нужно.

`content/home/factory-photos.json` — четыре фотографии, подписи дословно из эталона:

```json
[
  { "fayl": "/images/about-filter-sm.webp", "podpis": "Фильтры-сепараторы" },
  { "fayl": "/images/about-skids-sm.webp",  "podpis": "Блочные установки" },
  { "fayl": "/images/about-steel-sm.webp",  "podpis": "Системы из нержавеющей стали" },
  { "fayl": "/images/about-pipes-sm.webp",  "podpis": "Трубопроводная обвязка" }
]
```

`src/lib/content.js`:

```javascript
import sayt from '../../content/site.json';
import kategorii from '../../content/catalog/categories.json';
import otrasli from '../../content/home/industries.json';
import fotoProizvodstva from '../../content/home/factory-photos.json';

export { sayt, kategorii, otrasli, fotoProizvodstva };
```

- [ ] **Step 5: Прогнать тест**

Запуск: `npx vitest run tests/content.test.js`
Ожидается: PASS, все шесть проверок.

Проверка про существующие картинки — та самая страховка из Review Focus: если файл не скопирован, тест назовёт категорию и путь.

- [ ] **Step 6: Зафиксировать**

```bash
git add -A
git commit -m "Содержание: категории, контакты, отрасли, фотографии производства"
```

---

### Task 3: Шапка с навигацией

**Files:**
- Create: `src/components/Shapka.astro`
- Create: `content/menu.json`
- Modify: `src/layouts/Base.astro`
- Test: `tests/shapka.test.js`

**Interfaces:**
- Consumes: `Base.astro` из задачи 1, `sayt` и `kategorii` из задачи 2.
- Produces: компонент `Shapka.astro` без пропсов; `content/menu.json` — массив `[{ "podpis": "...", "adres": "...", "kolonki": [{ "zagolovok": "...", "punkty": [{ "podpis": "...", "adres": "..." }] }] }]`.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/shapka.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('шапка', () => {
  it('логотип ведёт на главную и имеет подпись', () => {
    const logo = $('header a img').first();
    expect(logo.attr('alt')).toBe('Таубер');
    expect($('header a').first().attr('href')).toBe('/');
  });

  it('в навигации все пять пунктов верхнего уровня, дословно как в эталоне', () => {
    const punkty = $('header nav [data-punkt]').map((_, a) => $(a).text().trim().split('\n')[0].trim()).get();
    expect(punkty.slice(0, 5)).toEqual(['Продукция', 'Проекты', 'Компания', 'Пресс-центр', 'Контакты']);
  });

  it('пункты без готовой страницы не являются ссылками — иначе они ведут в пустоту', () => {
    const bezStranicy = $('header nav [data-punkt]').filter((_, el) => {
      const podpis = $(el).text().trim();
      return ['Проекты', 'Компания', 'Пресс-центр', 'Контакты'].includes(podpis);
    });
    expect(bezStranicy.length).toBe(4);
    bezStranicy.each((_, el) => {
      expect($(el).prop('tagName').toLowerCase()).not.toBe('a');
    });
  });

  it('подменю открывается не только наведением: у «Продукции» есть кнопка с aria-expanded', () => {
    const knopka = $('header [data-podmenyu]');
    expect(knopka.length).toBe(1);
    expect(knopka.prop('tagName').toLowerCase()).toBe('button');
    expect(knopka.attr('aria-expanded')).toBe('false');
    expect(knopka.attr('aria-controls')).toBeTruthy();
  });

  it('пункты подменю присутствуют в разметке, а не подгружаются скриптом', () => {
    expect($('header nav a[href^="/catalog/"]').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npm run build && npx vitest run tests/shapka.test.js`
Ожидается: FAIL — тега `header` в сборке нет.

- [ ] **Step 3: Создать меню и шапку**

`content/menu.json` — дословно из метода `navVals` эталона (строка 3101). Пять пунктов верхнего уровня, у «Продукции» — три колонки подменю. `znachok` — иконка Material Symbols, `poyasnenie` — вторая строка пункта:

```json
[
  {
    "podpis": "Продукция",
    "adres": "/catalog/",
    "kolonki": [
      {
        "zagolovok": "Топливо и фильтрация",
        "punkty": [
          { "podpis": "Фильтры",              "poyasnenie": "Топливные и жидкостные",   "znachok": "filter_alt",    "adres": "/catalog/filters/" },
          { "podpis": "Фильтрационные модули","poyasnenie": "Модульная очистка сред",   "znachok": "deployed_code", "adres": "/catalog/fmod/" },
          { "podpis": "Пробоотборники",       "poyasnenie": "Закрытый отбор проб",      "znachok": "science",       "adres": "/catalog/probe/" }
        ]
      },
      {
        "zagolovok": "Авиация",
        "punkty": [
          { "podpis": "Обслуживание на стоянке", "poyasnenie": "Питание 400 Гц, PCA, кабели",   "znachok": "flight",             "adres": "/catalog/ground/" },
          { "podpis": "Гидрантная система",      "poyasnenie": "Пантографы, колодцы, клапаны",  "znachok": "local_gas_station",  "adres": "/catalog/hydrant/" },
          { "podpis": "ПИТ-системы",             "poyasnenie": "Подземные точки подключения",   "znachok": "input",              "adres": "/catalog/pit/" },
          { "podpis": "Кэдди",                   "poyasnenie": "Мобильные кабельные тележки",   "znachok": "trolley",            "adres": "/catalog/caddy/" }
        ]
      },
      {
        "zagolovok": "Нефтебазы и трубопроводы",
        "punkty": [
          { "podpis": "Трубопроводы",       "poyasnenie": "С внутренним покрытием",                "znachok": "plumbing",                 "adres": "/catalog/pipelines/" },
          { "podpis": "Слив/налив",         "poyasnenie": "Устройства верхнего и нижнего налива",  "znachok": "oil_barrel",               "adres": "/catalog/load/" },
          { "podpis": "Наливные комплексы", "poyasnenie": "Автоматизированные АНК",                "znachok": "precision_manufacturing",  "adres": "/catalog/auto/" }
        ]
      }
    ]
  },
  { "podpis": "Проекты",      "adres": null },
  { "podpis": "Компания",     "adres": null },
  { "podpis": "Пресс-центр",  "adres": null },
  { "podpis": "Контакты",     "adres": null }
]
```

`adres: null` означает, что страницы ещё нет: в эталоне эти четыре пункта тоже никуда не ведут. Такой пункт выводится как `<span>`, а не как ссылка, — иначе посетитель попадёт на пустую страницу. Когда раздел появится, `null` заменяется адресом, и пункт сам становится ссылкой.

`src/components/Shapka.astro` — вёрстку перенести из эталона, строки 26–61, заменив inline-стили на классы и токены. Ключевые требования:

- логотип — `sayt.logotip`, высота 74 пикселя, `alt` равен `sayt.nazvanie`, ссылка на `/`
- пункты — из `content/menu.json`, каждый с атрибутом `data-punkt`; пункт с `adres: null` выводится как `<span data-punkt>`, остальные — как `<a data-punkt>`
- «Продукция» ведёт на `/catalog/`, пункты подменю — на `/catalog/<klyuch>/`
- у пункта с подменю — вложенный `<button aria-expanded="false" aria-controls="...">` со значком `expand_more`; подменю раскрывается и по наведению (CSS), и по нажатию (небольшой скрипт, переключающий `aria-expanded`)
- подменю присутствует в HTML всегда, скрывается стилями — так его находят поисковики и читает клавиатура

Скрипт подменю — в самом компоненте, внизу:

```astro
<script>
  document.querySelectorAll('[data-podmenyu]').forEach((knopka) => {
    knopka.addEventListener('click', (e) => {
      e.preventDefault();
      const otkryto = knopka.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('[data-podmenyu]').forEach((k) => k.setAttribute('aria-expanded', 'false'));
      knopka.setAttribute('aria-expanded', String(!otkryto));
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-podmenyu]').forEach((k) => k.setAttribute('aria-expanded', 'false'));
    }
  });
</script>
```

Подключить `Shapka` в `Base.astro` перед `<slot />`.

- [ ] **Step 4: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/shapka.test.js`
Ожидается: PASS, все четыре проверки.

- [ ] **Step 5: Зафиксировать**

```bash
git add -A
git commit -m "Шапка: логотип, навигация, подменю с доступом по клавиатуре"
```

---

### Task 4: Мобильное меню

**Files:**
- Create: `src/components/MobilnoeMenyu.astro`
- Modify: `src/components/Shapka.astro`
- Test: `tests/mobilnoe-menyu.test.js`

**Interfaces:**
- Consumes: `kategorii` из задачи 2, `Shapka.astro` из задачи 3.
- Produces: компонент `MobilnoeMenyu.astro`; кнопка-бургер в шапке с `data-burger` и `aria-controls="mobilnoe-menyu"`.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/mobilnoe-menyu.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('мобильное меню', () => {
  it('бургер — это кнопка, доступная с клавиатуры', () => {
    const burger = $('[data-burger]');
    expect(burger.length).toBe(1);
    expect(burger.prop('tagName').toLowerCase()).toBe('button');
    expect(burger.attr('aria-label')).toBeTruthy();
  });

  it('бургер связан с меню и меню закрыто по умолчанию', () => {
    expect($('[data-burger]').attr('aria-controls')).toBe('mobilnoe-menyu');
    expect($('[data-burger]').attr('aria-expanded')).toBe('false');
    expect($('#mobilnoe-menyu').attr('hidden')).toBeDefined();
  });

  it('в меню перечислены все десять категорий короткими названиями', () => {
    const punkty = $('#mobilnoe-menyu a').map((_, a) => $(a).text().trim()).get();
    expect(punkty).toContain('Фильтры');
    expect(punkty).toContain('Кэдди');
    expect(punkty.length).toBeGreaterThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npm run build && npx vitest run tests/mobilnoe-menyu.test.js`
Ожидается: FAIL — элемента `[data-burger]` нет.

- [ ] **Step 3: Реализовать**

Вёрстку взять из эталона, строки 62–91 (блок `menuOpen` и список `menuCats`). Требования:

- бургер — настоящий `<button type="button" data-burger aria-label="Меню" aria-controls="mobilnoe-menyu" aria-expanded="false">`, а не `div`, иначе он недоступен с клавиатуры
- меню — `<nav id="mobilnoe-menyu" hidden>` со списком коротких названий всех категорий, ссылки `/catalog/<klyuch>/`
- показывается на ширине до 1024 пикселей, на большой ширине скрыто; обычная навигация — наоборот

```astro
<script>
  const burger = document.querySelector('[data-burger]');
  const menyu = document.getElementById('mobilnoe-menyu');
  burger?.addEventListener('click', () => {
    const otkryto = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!otkryto));
    menyu.hidden = otkryto;
    document.body.style.overflow = otkryto ? '' : 'hidden';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') burger.click();
  });
</script>
```

- [ ] **Step 4: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/mobilnoe-menyu.test.js`
Ожидается: PASS, все три проверки.

- [ ] **Step 5: Зафиксировать**

```bash
git add -A
git commit -m "Мобильное меню: бургер-кнопка, список категорий, закрытие по Escape"
```

---

### Task 5: Футер

**Files:**
- Create: `src/components/Futer.astro`
- Modify: `src/layouts/Base.astro`
- Test: `tests/futer.test.js`

**Interfaces:**
- Consumes: `sayt` и `kategorii` из задачи 2.
- Produces: компонент `Futer.astro` без пропсов.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/futer.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { sayt } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('футер', () => {
  it('присутствует и тёмный, как в эталоне', () => {
    expect($('footer').length).toBe(1);
  });

  it('в футере шесть первых категорий, как в эталоне', () => {
    const ssylki = $('footer a[href^="/catalog/"]');
    expect(ssylki.length).toBe(6);
    expect($(ssylki[0]).text().trim()).toBe('Фильтры');
  });

  it('контакты берутся из site.json, а не вписаны в вёрстку', () => {
    if (sayt.telefon) {
      expect($('footer').text()).toContain(sayt.telefon);
      expect($('footer a[href^="tel:"]').length).toBe(1);
    }
  });

  it('год в подписи текущий', () => {
    expect($('footer').text()).toContain(String(new Date().getFullYear()));
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npm run build && npx vitest run tests/futer.test.js`
Ожидается: FAIL — тега `footer` нет.

- [ ] **Step 3: Реализовать**

Вёрстку взять из эталона, строки 2466–2497. Фон `var(--futer)`, текст `var(--futer-tekst)`. Ссылки категорий — первые шесть из `kategorii`, короткими названиями (в эталоне это `footCats: SHORT.slice(0, 6)`). Телефон обернуть в `<a href="tel:...">`, почту — в `mailto:`. Год выводить как `new Date().getFullYear()`, а не числом. Подключить в `Base.astro` после `<slot />`.

- [ ] **Step 4: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/futer.test.js`
Ожидается: PASS, все четыре проверки.

- [ ] **Step 5: Зафиксировать**

```bash
git add -A
git commit -m "Футер: категории, контакты из site.json, текущий год"
```

---

### Task 6: Главная — герой и галерея производства

**Files:**
- Create: `src/components/Geroy.astro`
- Create: `src/components/GalereyaProizvodstva.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/glavnaya-geroy.test.js`

**Interfaces:**
- Consumes: `sayt` и `fotoProizvodstva` из задачи 2, `Base.astro` из задачи 1.
- Produces: компоненты `Geroy.astro` и `GalereyaProizvodstva.astro`, оба без пропсов.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/glavnaya-geroy.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';

let html, $;
beforeAll(() => {
  html = readFileSync('dist/index.html', 'utf8');
  $ = load(html);
});

describe('герой главной', () => {
  it('заголовок дословно как в эталоне и он единственный h1', () => {
    expect($('h1').length).toBe(1);
    expect($('h1').text().replace(/\s+/g, ' ').trim()).toBe('Собственное производство');
  });

  it('надзаголовок и вводный текст перенесены дословно', () => {
    const tekst = $('body').text();
    expect(tekst).toContain('Полный цикл — от проекта до испытаний');
    expect(tekst).toContain('Проектируем и изготавливаем сложное оборудование');
  });

  it('обе кнопки героя на месте', () => {
    const tekst = $('body').text();
    expect(tekst).toContain('О производстве');
    expect(tekst).toContain('Скачать каталог');
  });

  it('у всех фотографий производства есть подписи в alt', () => {
    const bezAlt = $('img').filter((_, img) => !$(img).attr('alt')).length;
    expect(bezAlt).toBe(0);
  });

  it('таймер галереи останавливается при скрытии вкладки', () => {
    expect(html).toContain('visibilitychange');
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npm run build && npx vitest run tests/glavnaya-geroy.test.js`
Ожидается: FAIL — на странице нет ни `h1` «Собственное производство», ни галереи.

- [ ] **Step 3: Реализовать**

Вёрстку взять из эталона, строки 92–142. Сетка героя в эталоне — `grid-template-columns: 37.1% 1fr 25%`; сохранить пропорции для широких экранов, адаптив делается в задаче 9.

`GalereyaProizvodstva.astro`: крупное фото плюс полоска превью, активное фото подсвечено оранжевой точкой (`var(--akcent)`, ширина 22 пикселя против 8). Перелистывание — по нажатию на превью и само по таймеру. Обязательно: таймер останавливается, когда вкладка скрыта, и при уходе со страницы.

```astro
<script>
  const galereya = document.querySelector('[data-galereya]');
  if (galereya) {
    const kadry = [...galereya.querySelectorAll('[data-kadr]')];
    const tochki = [...galereya.querySelectorAll('[data-tochka]')];
    let tekushchiy = 0;
    let taymer = null;

    const pokazat = (i) => {
      tekushchiy = (i + kadry.length) % kadry.length;
      kadry.forEach((k, n) => { k.style.opacity = n === tekushchiy ? '1' : '0'; });
      tochki.forEach((t, n) => {
        t.style.background = n === tekushchiy ? 'var(--akcent)' : 'rgba(255,255,255,.7)';
        t.style.width = n === tekushchiy ? '22px' : '8px';
        t.setAttribute('aria-current', String(n === tekushchiy));
      });
    };

    const pusk = () => { stop(); taymer = setInterval(() => pokazat(tekushchiy + 1), 5000); };
    const stop = () => { if (taymer) { clearInterval(taymer); taymer = null; } };

    tochki.forEach((t, n) => t.addEventListener('click', () => { pokazat(n); pusk(); }));
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : pusk()));
    window.addEventListener('pagehide', stop);
    pokazat(0);
    pusk();
  }
</script>
```

- [ ] **Step 4: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/glavnaya-geroy.test.js`
Ожидается: PASS, все пять проверок.

- [ ] **Step 5: Зафиксировать**

```bash
git add -A
git commit -m "Главная: герой и галерея производства с остановкой таймера"
```

---

### Task 7: Главная — секция «Основные категории»

**Files:**
- Create: `src/components/KartochkaKategorii.astro`
- Create: `src/components/SetkaKategoriy.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/glavnaya-kategorii.test.js`

**Interfaces:**
- Consumes: `kategorii` из задачи 2.
- Produces: `KartochkaKategorii.astro` с пропсами `{ kategoriya: { klyuch, nazvanie, kolichestvo, kartinka, svoye } }`; `SetkaKategoriy.astro` без пропсов.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/glavnaya-kategorii.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { load } from 'cheerio';
import { kategorii } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('категории на главной', () => {
  it('заголовок секции дословно как в эталоне', () => {
    const zagolovki = $('h2').map((_, h) => $(h).text().trim()).get();
    expect(zagolovki).toContain('Основные категории');
  });

  it('ровно десять карточек — вариант «5 × 2»', () => {
    expect($('[data-kartochka]').length).toBe(10);
  });

  it('порядок карточек совпадает с содержанием', () => {
    const nazvaniya = $('[data-kartochka] h3').map((_, h) => $(h).text().trim()).get();
    expect(nazvaniya).toEqual(kategorii.map((k) => k.nazvanie));
  });

  it('плашка «Собственное производство» только у своих категорий', () => {
    const splashkoy = $('[data-kartochka][data-svoye="true"]').length;
    expect(splashkoy).toBe(kategorii.filter((k) => k.svoye).length);
  });

  it('каждая карточка ведёт на страницу категории', () => {
    $('[data-kartochka]').each((_, k) => {
      expect($(k).find('a').attr('href')).toMatch(/^\/catalog\/[a-z0-9-]+\/$/);
    });
  });

  it('все картинки карточек реально существуют в сборке', () => {
    $('[data-kartochka] img').each((_, img) => {
      const src = $(img).attr('src');
      expect(existsSync(`dist${src}`), `нет файла ${src}`).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npm run build && npx vitest run tests/glavnaya-kategorii.test.js`
Ожидается: FAIL — элементов `[data-kartochka]` нет.

- [ ] **Step 3: Реализовать**

Вёрстку взять из эталона, строки 143–167 — это ветка `catsGrid`. Пять карточек в ряд на широком экране. Каждой карточке — атрибуты `data-kartochka` и `data-svoye`. Название в `<h3>`, количество товаров второстепенным текстом, плашка «Собственное производство» с оранжевой точкой — только при `svoye`, как в эталоне. Ссылка — `/catalog/<klyuch>/`; самих страниц категорий ещё нет, это нормально, они появятся на следующих этапах.

Проверка существования файлов в сборке — страховка из Review Focus: она поймает ссылку на изображение, которое не скопировали.

- [ ] **Step 4: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/glavnaya-kategorii.test.js`
Ожидается: PASS, все шесть проверок.

- [ ] **Step 5: Зафиксировать**

```bash
git add -A
git commit -m "Главная: секция основных категорий, десять карточек"
```

---

### Task 8: Главная — секция «Отрасли»

**Files:**
- Create: `src/components/Otrasli.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/glavnaya-otrasli.test.js`

**Interfaces:**
- Consumes: `otrasli` и `kategorii` из задачи 2.
- Produces: компонент `Otrasli.astro` без пропсов.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/glavnaya-otrasli.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { otrasli } from '../src/lib/content.js';

let $;
beforeAll(() => { $ = load(readFileSync('dist/index.html', 'utf8')); });

describe('отрасли на главной', () => {
  it('заголовок секции дословно как в эталоне', () => {
    const zagolovki = $('h2').map((_, h) => $(h).text().trim()).get();
    expect(zagolovki).toContain('Отрасли');
  });

  it('выведены все четыре отрасли из содержания', () => {
    expect($('[data-otrasl]').length).toBe(otrasli.length);
    expect(otrasli).toHaveLength(4);
  });

  it('названия отраслей перенесены дословно и в том же порядке', () => {
    const nazvaniya = $('[data-otrasl] [data-nazvanie]').map((_, n) => $(n).text().trim()).get();
    expect(nazvaniya).toEqual(['Аэропорты', 'Нефтебазы и терминалы', 'Склады ГСМ', 'Промышленные объекты']);
  });

  it('подпись про число направлений считается из содержания, а не вписана руками', () => {
    expect($('body').text()).toContain('4 направления каталога');
  });

  it('у каждой отрасли перечислены её категории ссылками', () => {
    $('[data-otrasl]').each((_, o) => {
      expect($(o).find('a[href^="/catalog/"]').length).toBeGreaterThan(0);
    });
  });

  it('вариант «Крупный шрифт»: название отрасли крупнее заголовка секции', () => {
    expect($('[data-otrasl] [data-nazvanie]').length).toBe(otrasli.length);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npm run build && npx vitest run tests/glavnaya-otrasli.test.js`
Ожидается: FAIL — элементов `[data-otrasl]` нет.

- [ ] **Step 3: Реализовать**

Вёрстку взять из эталона, строки 268–292 — это ветка `indType`, вариант «Крупный шрифт». Остальные четыре варианта отраслей не переносятся. Название отрасли — крупным начертанием с атрибутом `data-nazvanie`, под ним перечисление категорий ссылками на `/catalog/<klyuch>/`.

- [ ] **Step 4: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/glavnaya-otrasli.test.js`
Ожидается: PASS, все четыре проверки.

- [ ] **Step 5: Зафиксировать**

```bash
git add -A
git commit -m "Главная: секция отраслей в варианте «Крупный шрифт»"
```

---

### Task 9: Адаптивность каркаса

**Files:**
- Create: `src/styles/adaptiv.css`
- Modify: `src/styles/base.css`, компоненты шапки, героя, сетки категорий, отраслей и футера
- Test: `tests/adaptiv.test.js`

**Interfaces:**
- Consumes: все компоненты задач 3–8.
- Produces: контрольные точки `1280px`, `1024px`, `768px`, `480px`, используемые всеми компонентами.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/adaptiv.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

let css;
beforeAll(() => {
  const fayl = readdirSync('dist/_astro').find((f) => f.endsWith('.css'));
  css = readFileSync(`dist/_astro/${fayl}`, 'utf8');
});

describe('адаптивность', () => {
  it('описаны все контрольные точки', () => {
    for (const tochka of ['1280px', '1024px', '768px', '480px']) {
      expect(css, `нет медиазапроса для ${tochka}`).toContain(tochka);
    }
  });

  it('нет фиксированных ширин из макета — они вызывают горизонтальную прокрутку', () => {
    expect(css).not.toMatch(/width:\s*1600px/);
    expect(css).not.toMatch(/min-width:\s*1[2-9]\d\dpx[^)]*\}/);
  });

  it('изображения не выходят за пределы контейнера', () => {
    expect(css).toMatch(/img[^{]*\{[^}]*max-width:\s*100%/);
  });

  it('страница не прокручивается по горизонтали', () => {
    expect(css).toMatch(/overflow-x:\s*hidden/);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npm run build && npx vitest run tests/adaptiv.test.js`
Ожидается: FAIL — медиазапросов нет.

- [ ] **Step 3: Реализовать**

`src/styles/adaptiv.css` и правки компонентов:

- `img { max-width: 100%; height: auto; }` и `html { overflow-x: hidden; }` в `base.css`
- герой: на `1024px` сетка `37.1% 1fr 25%` превращается в одну колонку, галерея уезжает под текст; размер заголовка с 78 пикселей до 44 на `768px` и до 34 на `480px`
- категории: 5 в ряд → 4 на `1280px` → 3 на `1024px` → 2 на `768px` → 1 на `480px`
- шапка: обычная навигация скрывается на `1024px`, показывается бургер; на широкой ширине наоборот
- отрасли и футер: колонки складываются в одну на `768px`
- боковое поле `2.6%` заменить на `max(16px, 2.6%)`, чтобы на узком экране текст не прилипал к краю

- [ ] **Step 4: Собрать и прогнать тест**

Запуск: `npm run build && npx vitest run tests/adaptiv.test.js`
Ожидается: PASS, все четыре проверки.

- [ ] **Step 5: Проверить глазами на узком экране**

Запустить `npm run dev`, открыть страницу, включить в браузере режим устройства шириной 360 пикселей. Убедиться: горизонтальной прокрутки нет, заголовок не обрезан, карточки в одну колонку, бургер открывается и закрывается.

- [ ] **Step 6: Зафиксировать**

```bash
git add -A
git commit -m "Адаптивность каркаса: от 360 пикселей без горизонтальной прокрутки"
```

---

### Task 10: Публикация на Cloudflare Pages и постоянная ссылка

**Files:**
- Create: `.github/workflows/proverka.yml`
- Create: `docs/PUBLIKATSIYA.md`
- Modify: `docs/COLLABORATION.md`
- Test: `tests/sborka.test.js`

**Interfaces:**
- Consumes: всё, собранное в задачах 1–9.
- Produces: постоянный адрес сайта, отдельная ссылка для каждого pull request, проверка тестами при каждом pull request.

- [ ] **Step 1: Написать падающий тест**

```javascript
// tests/sborka.test.js
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('готовность к публикации', () => {
  it('сборка даёт главную страницу', () => {
    expect(existsSync('dist/index.html')).toBe(true);
  });

  it('описана проверка при pull request', () => {
    expect(existsSync('.github/workflows/proverka.yml')).toBe(true);
    const workflow = readFileSync('.github/workflows/proverka.yml', 'utf8');
    expect(workflow).toContain('pull_request');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('vitest');
  });

  it('инструкция по публикации написана', () => {
    expect(existsSync('docs/PUBLIKATSIYA.md')).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Запуск: `npx vitest run tests/sborka.test.js`
Ожидается: FAIL — файла `.github/workflows/proverka.yml` нет.

- [ ] **Step 3: Настроить проверку при pull request**

`.github/workflows/proverka.yml`:

```yaml
name: Проверка

on:
  pull_request:
  push:
    branches: [main]

jobs:
  proverka:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npx vitest run
```

- [ ] **Step 4: Описать подключение Cloudflare Pages**

`docs/PUBLIKATSIYA.md` — инструкция для Дениса, шагами, с указанием, что делает он сам, потому что подключение сервиса требует его входа:

1. Открыть `dash.cloudflare.com`, войти через GitHub.
2. Workers & Pages → Create → Pages → Connect to Git.
3. Разрешить доступ к репозиторию `dgorshenin555-commits/tauber-web`.
4. Настройки сборки: команда `npm run build`, каталог вывода `dist`, версия Node `22`.
5. Сохранить. Постоянный адрес получится вида `tauber-web.pages.dev`.

После подключения: слияние в `main` обновляет постоянный адрес, каждый pull request получает собственную ссылку для просмотра — она появляется в самом pull request.

В `docs/COLLABORATION.md` добавить раздел «Где смотреть сайт» с постоянным адресом и пояснением про ссылки у pull request.

- [ ] **Step 5: Прогнать все тесты целиком**

Запуск: `npm run build && npx vitest run`
Ожидается: PASS во всех файлах тестов задач 1–10.

- [ ] **Step 6: Зафиксировать и открыть pull request**

```bash
git add -A
git commit -m "Публикация: проверка при pull request и инструкция по Cloudflare Pages"
git push -u origin karkas-astro
gh pr create --fill --base main
```

Слияние делает Денис: у меня нет на это прав.

- [ ] **Step 7: После слияния — проверить живой сайт**

Открыть постоянный адрес, проверить на телефоне и на компьютере: главная открывается, шрифты свои, фотографии на месте, меню работает, горизонтальной прокрутки нет.

---

## Что остаётся за пределами этого плана

Страницы категорий и продуктов, отправка формы заявки, страница «О производстве». Они идут следующими этапами, по разделу за заход, каждый со своим обсуждением.
