/**
 * /llms.txt: a short, plain-text guide to the site for AI assistants
 * (ChatGPT, Claude, Perplexity, Gemini…), following the llms.txt proposal
 * (llmstxt.org). It gives them the facts in one place so answers about
 * Juan and his work are accurate and link back here.
 *
 * Built from the same content as the pages, so it never drifts.
 */
import type { APIRoute } from 'astro';
import { getDesignProjects, getGalleries, getPublicProjects } from '@/lib/content';
import { about, home, photography } from '@/data/pages';
import { site } from '@/data/site';
import { sameAs } from '@/lib/seo';

export const GET: APIRoute = async ({ site: base }) => {
  const url = (path: string) => new URL(path, base).href;
  const projects = await getPublicProjects();
  const galleries = await getGalleries();
  const design = await getDesignProjects();

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `In Juan's words: “${about.intro}”`,
    '',
    '## Key facts',
    '',
    `- Based in ${site.location}. Originally from Colombia.`,
    ...about.experience.map((e) => `- ${e.years}: ${e.role}, ${e.company} (${e.sector})`),
    ...home.highlights.map((h) => `- ${h.value} ${h.label}`),
    ...about.recognition.map((r) => `- Recognition: ${r.title}, ${r.detail}`),
    ...about.certifications.map((c) => `- Certification: ${c}`),
    '',
    '## Case studies',
    '',
    ...projects.map((p) => `- [${p.data.title}](${url(`/work/${p.id}/`)}): ${p.data.outcome} (${p.data.tags.join(', ')}; ${p.data.year})`),
    '',
    '## More work',
    '',
    `- [Graphic design](${url('/work/graphic-design/')}): ${design.length} identity, packaging and print projects, including ${design
      .slice(0, 4)
      .map((d) => d.data.title)
      .join(', ')}.`,
    ...galleries.map((g) => `- [${g.data.title}](${url(`/work/${g.id}/`)}): ${g.data.summary}`),
    '',
    '## About and contact',
    '',
    `- [About](${url('/about/')}): background, experience, principles and certifications.`,
    `- [Photography](${url('/photography/')}): ${photography.intro}`,
    `- [Contact](${url('/contact/')}): a form for projects, teams and roles. Replies within ${site.replyTime}.`,
    `- [Free guide: build your portfolio website with Claude](${url('/guide/')}): Juan's step-by-step workflow as a free PDF, with the accounts needed, a timeline and 10 copy-ready prompts.`,
    ...sameAs().map((href) => `- Profile: ${href}`),
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
