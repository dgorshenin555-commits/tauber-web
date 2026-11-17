# ASN-15P1 Mobile Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать мобильную версию страницы АСН-15П1 компактнее и удобнее на экранах 320–480 px без изменения её содержания и десктопной геометрии.

**Architecture:** Общий шаблон товара получает идентификатор страницы в DOM, чтобы мобильные стили первого экрана и ключевых параметров применялись только к АСН-15П1. Общая шапка получает безопасную сенсорную область телефона, а приоритетная форма — небольшой мобильный отступ. Поведение проверяется на собранной странице и визуально в реальном браузере.

**Tech Stack:** Astro, CSS, Vitest, Cheerio, браузерный просмотр.

**Spec:** `docs/superpowers/specs/2026-11-17-asn-15p1-mobile-design.md`

## Global Constraints

- Не менять технический текст, порядок секций и десктопную компоновку.
- Не применять компактные карточки фактов к другим товарам.
- Сохранить минимальный размер шрифта полей ввода 16 px и исключить горизонтальную прокрутку.
- Не добавлять зависимости.

## Review Focus

- Окно 320 px: текст кнопки первого экрана не переносится и документ не шире окна.
- Окно 320 px: активная область телефона не меньше 44 × 44 px.
- Окно 320 px: четыре ключевых параметра заметно компактнее прежних четырёх крупных карточек.
- Окна 390–480 px: значения и подписи параметров не накладываются друг на друга.
- Десктоп: карточки фактов и первый экран сохраняют прежнюю раскладку.

---

### Task 1: Компактная мобильная компоновка АСН-15П1

**Files:**
- Modify: `src/components/StranicaTovara.astro`
- Modify: `src/components/PrioritetnyyPodbor.astro`
- Modify: `src/components/Shapka.astro`
- Test: `tests/asn15p1-mobile.test.js`

**Interfaces:**
- Consumes: `klyuch` страницы товара, существующие классы `.fakty`, `.fakt`, `.tovar-verh__knopka`, `.shapka__telefon` и `.prioritetnyy-podbor`.
- Produces: `data-tovar="asn-15p1-mobile"` на первом экране и `data-stranica="asn-15p1-mobile"` на блоке фактов как стабильные границы мобильных стилей.

- [ ] **Step 1: Write the failing test**

Добавить проверку собранного HTML: первый экран и блок фактов имеют идентификатор страницы, а четыре факта сохраняют значения и подписи.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && npx vitest run tests/asn15p1-mobile.test.js`

Expected: FAIL — атрибуты области страницы отсутствуют.

- [ ] **Step 3: Implement the mobile layout**

Добавить DOM-границы страницы и стили до 480 px: компактные строки фактов, однострочную кнопку первого экрана, уменьшенные внутренние отступы формы и первого экрана, сенсорную область телефона 44 × 44 px.

- [ ] **Step 4: Run automated verification**

Run: `npm run build && npm test`

Expected: 27 test files and all tests PASS.

- [ ] **Step 5: Verify browser behavior**

На 320 × 700 и 390 × 844 проверить размеры элементов, отсутствие горизонтальной прокрутки, полный текст параметров и неизменённый десктоп.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-11-17-asn-15p1-mobile-design.md docs/superpowers/plans/2026-11-17-asn15p1-mobile-optimization.md tests/asn15p1-mobile.test.js src/components/StranicaTovara.astro src/components/PrioritetnyyPodbor.astro src/components/Shapka.astro
git commit -m "fix: compact ASN-15P1 mobile layout"
```
