import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // сайт публикуется не в корне домена, а в подпапке с именем репозитория
  site: 'https://dgorshenin555-commits.github.io',
  base: '/tauber-web',
  build: { inlineStylesheets: 'never' },
  // каталог и есть главный экран — так в эталоне
  redirects: { '/catalog': '/' },
});
