import { site } from '@/data/site';

/** The Monday on or after `from + leadDays`. */
export function nextStartDate(from: Date, leadDays: number): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + leadDays);
  const daysToMonday = (8 - d.getDay()) % 7;
  d.setDate(d.getDate() + daysToMonday);
  return d;
}

/** The availability sentence for a given day, or null when hidden. */
export function availabilityText(now: Date = new Date()): string | null {
  const a = site.availability;
  if (a.mode === 'hidden') return null;
  if (a.mode === 'fixed') return a.fixedText;
  const date = nextStartDate(now, a.leadDays).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `${a.prefix} ${date}`;
}
