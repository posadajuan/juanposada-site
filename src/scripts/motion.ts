/**
 * Motion behaviours that need JavaScript: scroll reveals, number
 * count-up, image parallax and the smart navigation.
 *
 * Runs on every page (and again after each page transition). Does
 * nothing when the visitor's device asks for reduced motion.
 */

const root = document.documentElement;
const motionOn = () => root.hasAttribute('data-motion');
let cleanups: Array<() => void> = [];

/* ---------- Count-up ---------- */

type Parsed = { prefix: string; value: number; decimals: number; commas: boolean; suffix: string };

function parse(text: string): Parsed | null {
  const m = text.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s);
  if (!m) return null;
  const [, prefix = '', digits = '', suffix = ''] = m;
  return {
    prefix,
    value: parseFloat(digits.replace(/,/g, '')),
    decimals: (digits.split('.')[1] ?? '').length,
    commas: digits.includes(','),
    suffix,
  };
}

function format(n: number, p: Parsed): string {
  const fixed = n.toFixed(p.decimals);
  const body = p.commas
    ? Number(fixed).toLocaleString('en-GB', { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
    : fixed;
  return `${p.prefix}${body}${p.suffix}`;
}

function countUp(el: HTMLElement) {
  const final = el.dataset.count ?? '';
  const p = parse(final);
  if (!p) return;
  const start = performance.now();
  const duration = 1400;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = t < 1 ? format(p.value * eased, p) : final;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- Scroll reveal ---------- */

function initReveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
  const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));

  if (!motionOn() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  // Numbers start at zero, then count up when they come into view.
  counters.forEach((el) => {
    const p = parse(el.dataset.count ?? '');
    if (p) el.textContent = format(0, p);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);

      arriving.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        el.style.setProperty('--reveal-i', String(Math.min(i, 5)));
        el.classList.add('is-in');
        observer.unobserve(el);
        const nested = el.matches('[data-count]') ? [el] : Array.from(el.querySelectorAll<HTMLElement>('[data-count]'));
        nested.forEach(countUp);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );

  items.forEach((el) => observer.observe(el));
  cleanups.push(() => observer.disconnect());
}

/* ---------- Parallax ---------- */

function initParallax() {
  if (!motionOn()) return;
  const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!frames.length) return;

  const visible = new Set<HTMLElement>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement)));
    schedule();
  });
  frames.forEach((f) => observer.observe(f));

  let frame = 0;
  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    visible.forEach((el) => {
      const r = el.getBoundingClientRect();
      // -1 when the frame enters at the bottom, +1 as it leaves at the top
      const progress = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      const range = Math.min(30, r.height * 0.05);
      el.style.setProperty('--py', `${(progress * range).toFixed(1)}px`);
    });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  schedule();
  cleanups.push(() => {
    observer.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (frame) cancelAnimationFrame(frame);
  });
}

/* ---------- Smart navigation ---------- */

function initNav() {
  root.removeAttribute('data-nav-hidden');
  if (!motionOn()) return;

  let last = window.scrollY;
  let frame = 0;
  const update = () => {
    frame = 0;
    const y = window.scrollY;
    const header = document.querySelector('.site-header');
    const keepVisible =
      y < 120 || document.querySelector('[data-menu][data-open]') !== null || (header?.contains(document.activeElement) ?? false);
    if (keepVisible || y < last - 4) root.removeAttribute('data-nav-hidden');
    else if (y > last + 4) root.setAttribute('data-nav-hidden', '');
    last = y;
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onFocus = (e: FocusEvent) => {
    if ((e.target as Element | null)?.closest?.('.site-header')) root.removeAttribute('data-nav-hidden');
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('focusin', onFocus);
  cleanups.push(() => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('focusin', onFocus);
    root.removeAttribute('data-nav-hidden');
  });
}

/* ---------- Lifecycle ---------- */

function teardown() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

document.addEventListener('astro:page-load', () => {
  teardown();
  initReveal();
  initParallax();
  initNav();
});

document.addEventListener('astro:before-swap', teardown);
