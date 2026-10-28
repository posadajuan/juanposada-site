/**
 * /sitemap.xml: every public page, so search engines find them all.
 * Built from your content, so new case studies and galleries are added
 * automatically. Hidden pages (drafts, private projects, the style guide,
 * the 404 page) are left out.
 */
import type { APIRoute } from 'astro';
import { getGalleries, getPublicProjects } from '@/lib/content';

export const GET: APIRoute = async ({ site }) => {
  const projects = await getPublicProjects();
  const galleries = await getGalleries();

  const paths = [
    '/',
    '/work/',
    ...projects.map((p) => `/work/${p.id}/`),
    '/work/graphic-design/',
    ...galleries.map((g) => `/work/${g.id}/`),
    '/photography/',
    '/about/',
    '/contact/',
  ];

  const urls = paths.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
