# Vellum Refresh Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for integration and dispatch independent UI tasks under superpowers:dispatching-parallel-agents. Track work using the checkboxes below.

**Goal:** Bring the current Astro website into the supplied Vellum design while retaining collaborative content editing and deployment.

**Architecture:** Keep existing Astro routes, JSON content and shared components. Update scoped component styles and common tokens; retain the exact new source as a versioned reference. The runtime of the exported prototype is reference-only.

**Tech Stack:** Astro, CSS, local fonts, Vitest/Cheerio, GitHub Pages.

**Spec:** ../specs/2026-09-25-vellum-refresh.md

## Global Constraints
- Base path `/tauber-web/`; 10 categories and 16 current product routes preserved.
- New HTML has priority over the style note where they differ.
- Manrope 300/400, Cyrillic, local fonts; no fixed 1600px wrapper or zoom.
- Keep editable JSON; no invented specifications or fake successful submissions.
- Isolated branch in the fresh dedicated clone `tauber-web`; original archive untouched.

## Review Focus
- Mobile overflow at 390px and compact navigation at 1280px.
- Relative image and link paths under GitHub Pages.
- Keyboard access, Escape and focus restoration for the drawer.
- Missing product content and technical values compared with the latest reference.
- Font subsets/weights, low contrast and stale accent colours.

### Task 1: Reference, baseline, common theme (root)
Files: design/vellum/*; src/styles/{tokens,fonts,base}.css; tests/karkas.test.js; docs/COLLABORATION.md.
Interfaces: existing CSS variable names retained; `--shrift` becomes Manrope. Shared assets remain under /images/.
- [x] Run `npm run build && npm test` before edits and record baseline.
- [x] Change theme tests to require Vellum colours and local Manrope subsets; run against baseline to observe failure.
- [x] Copy reference without modification; download official Manrope font assets; update tokens/global type.
- [x] Build and test after integrating component work.

### Task 2: Home content components (independent)
Files: Geroy, GalereyaProizvodstva, SetkaKategoriy, KartochkaKategorii, Otrasli, PanelZadacha; associated home tests only.
Interfaces: existing JSON imports and data attributes preserved; consumes theme tokens from Task 1.
- [x] Compare rendered-reference HTML block styles with current components.
- [x] Update layout, colours, type, radii and spacing directly in scoped styles.
- [x] Preserve gallery/accordion interactions, address motion preference regression if needed.
- [x] Test existing home behavior; update only deliberately superseded design assertions.

### Task 3: Category and product views (independent)
Files: StranicaKategorii, StranicaTovara, catalog/[klyuch].astro; content/catalog and content/tovary if required; associated tests.
Interfaces: current JSON schema and routes remain compatible, shared theme variables from Task 1.
- [x] Compare fresh category/product source with existing data for missing content.
- [x] Transfer Vellum layouts and any lost values/sections, retaining separate JSON.
- [x] Preserve product selection and links, adapt grids and long titles.
- [x] Check every generated category/product retains heading/content and valid image paths.

### Task 4: Header, drawer and footer (independent)
Files: Shapka, MobilnoeMenyu, Futer; associated tests.
Interfaces: existing navigation JSON, data-burger, logo and shared variables.
- [x] Match new source header capsule, dark CTA and light footer.
- [x] Replace dropdown mobile list with accessible side drawer; visible burger on desktop.
- [x] Verify opening, closing, Escape, focus, body scroll and mobile fit.

### Task 5: Integration, review and delivery (root)
- [x] Run `npm run build && npm test`, fix actual regressions.
- [x] Open local preview; inspect home, category, product at 1280/768/390px and check interactions.
- [x] Review diff, run independent review, document results/limitations.
- [ ] Commit, push feature branch, create PR and attach it to the task. Keep local preview available.

## Validation and scope
- Baseline: 28 generated pages and 122 passing tests. Final: 28 pages, 127 passing tests in 17 files; `git diff --check` clean.
- All 193 reference files preserved byte-for-byte. Original archive remains outside the repository.
- Browser: home/category/product samples at 390/768/1280 px; all category/product routes checked at 390 px. Final home with local Manrope has no horizontal overflow at all three widths. Drawer Escape/focus/scroll behavior verified.
- Independent code review: no actionable findings.
- Product pages use shared Astro layouts; individual exported product compositions are not reproduced pixel-for-pixel. Missing structured sections and technical values were restored from the reference.
- Existing informational pages (company/projects/press/contacts/policy) remain unimplemented. Requests still open the mail client; a server form is not included.
- Deployment occurs after the PR is merged into main.
