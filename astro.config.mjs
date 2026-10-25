// @ts-check
import { defineConfig } from 'astro/config';

// Static site, deployed to Cloudflare Pages.
// The contact form runs as a Cloudflare Pages Function (see /functions).
export default defineConfig({
  site: 'https://juanposada.co.uk',
  trailingSlash: 'ignore',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
