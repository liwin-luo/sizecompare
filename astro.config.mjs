// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Canonical origin — used by sitemap and og:url. Must match the live domain.
const SITE = 'https://sizecompare.org';

export default defineConfig({
  site: SITE,
  integrations: [react(), sitemap()],
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
});
