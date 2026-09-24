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

  it('проверка ставит зависимости из package-lock, а не как попало', () => {
    expect(existsSync('package-lock.json')).toBe(true);
    const workflow = readFileSync('.github/workflows/proverka.yml', 'utf8');
    expect(workflow).toContain('npm ci');
  });

  it('описана публикация на GitHub Pages', () => {
    expect(existsSync('.github/workflows/publikaciya.yml')).toBe(true);
    const w = readFileSync('.github/workflows/publikaciya.yml', 'utf8');
    expect(w).toContain('actions/deploy-pages');
    expect(w).toContain('actions/upload-pages-artifact');
    expect(w).toContain('pages: write');
  });

  it('в настройках сборки задана подпапка сайта — без неё ссылки уйдут в пустоту', () => {
    const conf = readFileSync('astro.config.mjs', 'utf8');
    expect(conf).toContain("base: '/tauber-web'");
    expect(conf).toContain('github.io');
  });

  it('инструкция по публикации написана и называет команду сборки и каталог', () => {
    expect(existsSync('docs/PUBLIKATSIYA.md')).toBe(true);
    const doc = readFileSync('docs/PUBLIKATSIYA.md', 'utf8');
    expect(doc).toContain('npm run build');
    expect(doc).toContain('dist');
  });

  it('служебные папки не попадают в репозиторий', () => {
    const ignore = readFileSync('.gitignore', 'utf8');
    for (const papka of ['node_modules/', 'dist/', '.astro/']) {
      expect(ignore, `${papka} должна игнорироваться`).toContain(papka);
    }
  });
});
