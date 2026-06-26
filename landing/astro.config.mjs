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
  // ponytail: el apex noanet.com.ar devuelve 503; www es el host que responde 200.
  // Si infra arregla el apex, sobreescribir con PUBLIC_SITE_URL=https://noanet.com.ar
  site: process.env.PUBLIC_SITE_URL ?? 'https://www.noanet.com.ar',
  output: 'server',
  adapter,
  integrations: [sitemap()],
  vite: {
    css: {
      postcss: './postcss.config.mjs'
    },
    // Permite ver el dev server a través de tunnels (cloudflared/trycloudflare)
    server: {
      allowedHosts: ['.trycloudflare.com']
    }
  }
});
