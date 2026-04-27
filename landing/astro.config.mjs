import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://noanet.com.ar',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    css: {
      postcss: './postcss.config.mjs'
    }
  }
});
