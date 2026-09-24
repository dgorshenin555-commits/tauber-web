import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://tauber-web.pages.dev',
  build: { inlineStylesheets: 'never' },
});
