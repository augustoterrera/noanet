import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adapterTarget = process.env.ASTRO_ADAPTER ?? (process.env.VERCEL ? 'vercel' : 'node');

const adapter =
  adapterTarget === 'vercel'
    ? (await import('@astrojs/vercel')).default({
        imageService: true,
      })
    : (await import('@astrojs/node')).default({
        mode: 'standalone',
      });

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.agromovil.noanet.com.ar',
  output: 'server',
  adapter,
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
