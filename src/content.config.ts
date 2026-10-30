/**
 * Content structure for the site.
 *
 * Each project, gallery and photo series is ONE folder with an
 * index.md file plus its images. Folders starting with "_" (like
 * _template) are ignored, so they can hold examples.
 *
 * If a required field is missing or wrong, the build stops and says
 * exactly which file and field to fix.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const entryFiles = '[!_]*/index.md';
const year = z.union([z.string(), z.number()]).transform(String);

/* ---------- Case studies (Template A) ---------- */

const caseStudySections = ['snapshot', 'problem', 'research', 'solution', 'impact', 'reflection'] as const;

const projects = defineCollection({
  loader: glob({ pattern: entryFiles, base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        /** Optional title for search results and link previews, when the project title alone doesn't say who it was for. */
        metaTitle: z.string().optional(),
        /** One line: what changed because of the work. Shown on cards and as the subtitle. */
        outcome: z.string().max(160, 'Keep the outcome to one short sentence (160 characters max).'),
        tags: z.array(z.string()).min(1).max(3),
        year,
        /** Lower numbers appear first on the Work page. */
        order: z.number().default(100),
        /** Show on the Home page "Selected work" (pick up to 4). */
        featured: z.boolean().default(false),
        /** Hide everywhere while you're still writing it. */
        draft: z.boolean().default(false),
        /** NDA work: shows a locked card with "Ask for access" and no case study page. */
        private: z.boolean().default(false),
        /** Reading time in minutes. Worked out automatically if left out. */
        readingTime: z.number().optional(),

        cover: image(),
        coverAlt: z.string(),

        // The case study itself. Required unless the project is private.
        snapshot: z
          .object({
            role: z.string(),
            team: z.string(),
            timeline: z.string(),
            tools: z.array(z.string()).default([]),
            impact: z.string(),
          })
          .optional(),

        problem: z
          .object({
            headline: z.string(),
            text: z.string(),
            image: image().optional(),
            imageAlt: z.string().optional(),
          })
          .optional(),

        research: z
          .object({
            headline: z.string(),
            text: z.string(),
            insights: z.array(z.string()).max(3).default([]),
            quote: z.object({ text: z.string(), by: z.string() }).optional(),
          })
          .optional(),

        solution: z
          .object({
            headline: z.string(),
            /** Alternating image + text rows. 2–3 works best. */
            decisions: z
              .array(
                z.object({
                  title: z.string(),
                  text: z.string(),
                  image: image(),
                  imageAlt: z.string(),
                  /** Show the image full width with the text below. Wide images (about 2:1 or wider) do this automatically. */
                  wide: z.boolean().optional(),
                }),
              )
              .max(4)
              .default([]),
            /** Optional big full-width image. */
            showcase: image().optional(),
            showcaseAlt: z.string().optional(),
            /** Optional pair of detail images (a single one shows full width). */
            details: z
              .array(z.object({ image: image(), imageAlt: z.string() }))
              .max(2)
              .default([]),
          })
          .optional(),

        impact: z
          .object({
            headline: z.string(),
            stats: z
              .array(z.object({ value: z.string(), label: z.string() }))
              .max(3)
              .default([]),
          })
          .optional(),

        reflection: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        if (data.private) return;
        for (const key of caseStudySections) {
          if (data[key] === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [key],
              message: `"${key}" is required for a public case study (or set private: true).`,
            });
          }
        }
      }),
});

/* ---------- Galleries: logo collection and graphic pieces (Templates B and C) ---------- */

const galleries = defineCollection({
  loader: glob({ pattern: entryFiles, base: './src/content/galleries' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kind: z.enum(['logos', 'graphics']),
      intro: z.string(),
      /** Short line for the card on the Work page. */
      summary: z.string(),
      order: z.number().default(100),
      draft: z.boolean().default(false),
      cover: image(),
      coverAlt: z.string(),
      items: z
        .array(
          z.object({
            image: image(),
            alt: z.string(),
            title: z.string(),
            year: year.optional(),
            caption: z.string().optional(),
          }),
        )
        .min(1),
    }),
});

/* ---------- Photography series ---------- */

const photography = defineCollection({
  loader: glob({ pattern: entryFiles, base: './src/content/photography' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      place: z.string(),
      year,
      order: z.number().default(100),
      draft: z.boolean().default(false),
      /** Which photo (counting from 1) gets the big featured spot. */
      featured: z.number().int().min(1).default(1),
      photos: z
        .array(
          z.object({
            image: image(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        )
        .min(1),
    }),
});

/* ---------- Graphic design: small projects, title + visuals ---------- */
// One folder per project with an index.md (title, one line, image
// descriptions). The images themselves are picked up from the folder.

const graphicDesign = defineCollection({
  loader: glob({ pattern: entryFiles, base: './src/content/graphic-design' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    order: z.number().default(100),
    draft: z.boolean().default(false),
    /** Image descriptions, keyed by file name without extension. */
    alts: z.record(z.string()).default({}),
  }),
});


/* ---------- Application pages (/for/<company>) ---------- */
// One folder per job application: src/content/for/<company-slug>/index.md
// These pages are hidden: not in the menu, sitemap or search engines.
// Only people with the link (the hiring team) will see them.

const applications = defineCollection({
  loader: glob({ pattern: entryFiles, base: './src/content/for' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    /** Date the page was made, e.g. 2026-10-30. */
    date: z.coerce.date(),
    /** Hide the page while drafting. */
    draft: z.boolean().default(false),
    /** Headline: text, then the gradient words, then text. */
    hero: z.object({ before: z.string(), highlight: z.string(), after: z.string().default('') }),
    /** 2–3 sentences: why this company and this role. */
    intro: z.string().max(600, 'Keep the intro short (600 characters max).'),
    /** What they need (from the job ad) and the proof that Juan can do it. 3 works best. */
    fit: z
      .array(z.object({ need: z.string(), proof: z.string() }))
      .min(2)
      .max(4),
    /** Folder names of case studies to show (from src/content/projects). Up to 3. */
    projects: z.array(z.string()).max(3).default([]),
    /** Optional first-90-days plan. */
    plan: z
      .array(z.object({ when: z.string(), what: z.string() }))
      .max(3)
      .default([]),
    /** Optional tailored CV in /public, e.g. /cv/juan-posada-cv-lego.pdf */
    cv: z.string().optional(),
    /** Optional closing line above the contact buttons. */
    closing: z.string().optional(),
  }),
});

export const collections = { projects, galleries, photography, graphicDesign, applications };
