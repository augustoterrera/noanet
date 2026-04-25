import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
