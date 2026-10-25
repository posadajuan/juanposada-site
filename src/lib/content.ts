import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Gallery = CollectionEntry<'galleries'>;
export type PhotoSeries = CollectionEntry<'photography'>;

/** Drafts show while developing locally, never on the live site. */
const isVisible = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

const byOrder = (a: { data: { order: number; title: string } }, b: { data: { order: number; title: string } }) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects', isVisible)).sort(byOrder);
}

export async function getPublicProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => !p.data.private);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  return (await getPublicProjects()).filter((p) => p.data.featured).slice(0, limit);
}

export async function getGalleries(kind?: Gallery['data']['kind']): Promise<Gallery[]> {
  const all = (await getCollection('galleries', isVisible)).sort(byOrder);
  return kind ? all.filter((g) => g.data.kind === kind) : all;
}

export async function getPhotoSeries(): Promise<PhotoSeries[]> {
  return (await getCollection('photography', isVisible)).sort(byOrder);
}

/** The next public case study, wrapping round to the first. */
export function nextProject(list: Project[], current: Project): Project | undefined {
  const publicList = list.filter((p) => !p.data.private);
  if (publicList.length < 2) return undefined;
  const i = publicList.findIndex((p) => p.id === current.id);
  return publicList[(i + 1) % publicList.length];
}

/** Rough reading time: ~200 words a minute plus ~10 seconds per image. */
export function readingTime(project: Project): number {
  if (project.data.readingTime) return project.data.readingTime;
  let words = 0;
  let images = 0;
  const walk = (value: unknown) => {
    if (typeof value === 'string') words += value.split(/\s+/).filter(Boolean).length;
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') {
      if ('src' in value && 'width' in value) images += 1;
      else Object.values(value).forEach(walk);
    }
  };
  walk(project.data);
  return Math.max(2, Math.round(words / 200 + (images * 10) / 60));
}
