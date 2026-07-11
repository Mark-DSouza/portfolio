// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://markdsouza.dev',
  output: 'static',
  // Tests build fixture content into per-variant output/cache dirs; real builds use
  // dist/ and .astro/. The env protocol is owned by tests/e2e/harness.ts — see there
  // for why the cache split is load-bearing.
  outDir: process.env.OUT_DIR ?? './dist',
  cacheDir: process.env.CACHE_DIR ?? './.astro',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
