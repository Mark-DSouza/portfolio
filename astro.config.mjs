// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://markdsouza.dev',
  output: 'static',

  // Tests build fixture content into separate output/cache dirs; real builds use dist/ and .astro/.
  // The cache split matters: the content-layer data store persists entries across builds,
  // so sharing it between fixture and real content leaks fixture pages into real output.
  outDir: process.env.OUT_DIR ?? './dist',

  cacheDir: process.env.CACHE_DIR ?? './.astro',
  integrations: [mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});