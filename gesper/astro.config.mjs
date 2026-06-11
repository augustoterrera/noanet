import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const adapterTarget = process.env.ASTRO_ADAPTER ?? (process.env.VERCEL ? 'vercel' : 'node');

const adapter =
  adapterTarget === 'vercel'
    ? (await import('@astrojs/vercel')).default()
    : (await import('@astrojs/node')).default({
        mode: 'standalone',
      });

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://gesper.noanet.com.ar',
  output: 'server',
  adapter,
  integrations: [tailwind()],
});
