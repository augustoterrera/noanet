import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function inlineBuiltStyles() {
  return {
    name: 'inline-built-styles',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const astroDir = path.join(outDir, '_astro');
        const htmlFiles = await findFiles(outDir, '.html');
        const cssFiles = await findFiles(astroDir, '.css');
        const cssByHref = new Map();

        for (const file of cssFiles) {
          const href = `/${path.relative(outDir, file).replaceAll(path.sep, '/')}`;
          cssByHref.set(href, await readFile(file, 'utf8'));
        }

        for (const file of htmlFiles) {
          let html = await readFile(file, 'utf8');
          html = html.replace(/<link rel="stylesheet" href="([^"]+\.css)">/g, (match, href) => {
            const css = cssByHref.get(href);
            return css ? `<style>${css}</style>` : match;
          });
          await writeFile(file, html);
        }

        for (const file of cssFiles) {
          await unlink(file);
        }
      },
    },
  };
}

async function findFiles(dir, extension) {
  let entries = [];

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findFiles(fullPath, extension);
      }

      if (entry.isFile() && entry.name.endsWith(extension)) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://www.agromovil.noanet.com.ar',
  integrations: [tailwind(), inlineBuiltStyles()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
});
