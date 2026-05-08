import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const adapterTarget = process.env.ASTRO_ADAPTER ?? (process.env.VERCEL ? 'vercel' : 'node');

const adapter =
  adapterTarget === 'vercel'
    ? (await import('@astrojs/vercel')).default()
    : (await import('@astrojs/node')).default({
        mode: 'standalone',
      });

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://noanet.com.ar',
  output: 'server',
  adapter,
  integrations: [sitemap()],
  vite: {
    css: {
      postcss: './postcss.config.mjs'
    }
  }
});
