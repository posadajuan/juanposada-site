/**
 * Search, sharing and AI-search helpers.
 *
 * - socialImage(): a 1200×630 JPEG for link previews (LinkedIn, WhatsApp, Slack…)
 * - personSchema(): who Juan is, as structured data that Google and AI
 *   assistants read (schema.org). Built from site.ts and pages.ts, so it
 *   stays in step with the visible page.
 */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { site } from '@/data/site';
import { about } from '@/data/pages';

export const SOCIAL_IMAGE = { width: 1200, height: 630 } as const;

/** Crops any image to the 1200×630 shape social networks expect. */
export async function socialImage(src: ImageMetadata): Promise<string> {
  const img = await getImage({ src, ...SOCIAL_IMAGE, fit: 'cover', position: 'center', format: 'jpg', quality: 82 });
  return img.src;
}

/** Ensures one canonical address per page: always with a trailing slash. */
export function canonicalPath(pathname: string): string {
  if (pathname === '/' || /\.[a-z0-9]+$/i.test(pathname)) return pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export const sameAs = () => site.socials.map((s) => s.href).filter(Boolean);

export const PERSON_ID = `${site.url}/#person`;
export const WEBSITE_ID = `${site.url}/#website`;

export async function personSchema() {
  const portrait = await getImage({ src: about.portrait, width: 800, format: 'jpg' });
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    url: `${site.url}/`,
    image: new URL(portrait.src, site.url).href,
    jobTitle: 'Designer',
    description: site.description,
    worksFor: { '@type': 'Organization', name: 'QA Ltd' },
    address: { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' },
    knowsAbout: [
      'Product design',
      'UX design',
      'UI design',
      'Brand identity',
      'Graphic design',
      'Packaging design',
      'Digital learning',
      'Illustration',
      'Character design',
      'Motion design',
    ],
    hasCredential: about.certifications.map((name) => ({ '@type': 'EducationalOccupationalCredential', name })),
    sameAs: sameAs(),
  };
}

export const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: site.name,
  url: `${site.url}/`,
  description: site.description,
  inLanguage: 'en-GB',
  publisher: { '@id': PERSON_ID },
});
