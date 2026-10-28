/**
 * /robots.txt: tells search engines and AI assistants what they may read.
 *
 * Everything public is open, including AI search and answer engines
 * (ChatGPT, Claude, Perplexity, Gemini), so the site can be found and
 * quoted when someone asks about Juan or his work. Only the internal
 * style guide and the contact form's back end are off limits.
 *
 * Note: Cloudflare can also block AI crawlers before they reach this file
 * (Security → Settings → AI bots). See docs/SEO.md.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const body = `# Juan Posada, designer in London
# Search engines and AI assistants are welcome to read and link to this site.

User-agent: *
Allow: /
Disallow: /styleguide
Disallow: /api/

Sitemap: ${new URL('/sitemap.xml', site).href}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
