import type { ImageMetadata } from 'astro';

/**
 * Every image inside src/content/graphic-design/<project>/, grouped by
 * project folder and sorted by file name (01-, 02-…).
 */
const files = import.meta.glob<ImageMetadata>('/src/content/graphic-design/*/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

export type DesignImage = { name: string; src: ImageMetadata };

export function designImages(projectId: string): DesignImage[] {
  return Object.entries(files)
    .filter(([path]) => path.split('/').at(-2) === projectId)
    .map(([path, src]) => ({ name: path.split('/').at(-1)!.replace(/\.[^.]+$/, ''), src }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

/**
 * Split images into rows that share one height, so every image keeps its
 * own shape and a project's images sit together as one block.
 * A row is closed once its combined width-to-height ratio reaches `target`.
 */
export function toRows<T extends { src: ImageMetadata }>(images: T[], target = 3.2): T[][] {
  const rows: T[][] = [];
  let row: T[] = [];
  let sum = 0;
  for (const img of images) {
    row.push(img);
    sum += img.src.width / img.src.height;
    if (sum >= target || row.length === 3) {
      rows.push(row);
      row = [];
      sum = 0;
    }
  }
  if (row.length) {
    // Avoid a lonely last image: fold it into the previous row if that stays reasonable.
    const prev = rows.at(-1);
    if (row.length === 1 && prev && prev.length < 3) prev.push(row[0]!);
    else rows.push(row);
  }
  return rows;
}
