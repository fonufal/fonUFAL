import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fonufal.github.io',
  base: process.env.BASE_PATH || '/fonUFAL',
  integrations: [mdx(), sitemap()],
  build: { inlineStylesheets: 'always' },
});
