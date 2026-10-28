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
  const start = performance.now() + 200;
  const duration = 1800;
  const tick = (now: number) => {
    const t = Math.max(0, Math.min(1, (now - start) / duration));
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = t < 1 ? format(p.value * eased, p) : final;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- Scroll reveal ---------- */

const STEP_MS = 130;
const SETTLE_MS = 1300;

/** Once an element has finished arriving, hand it back to its normal styles. */
function settle(el: HTMLElement, delay: number) {
  window.setTimeout(() => {
    el.removeAttribute('data-reveal');
    el.classList.remove('is-in');
    el.style.removeProperty('--reveal-i');
  }, delay);
}

function initReveal() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));

  if (!motionOn() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.removeAttribute('data-reveal'));
    return;
  }

  // Parts of a staggered block arrive in order: label, heading, text, image…
  document.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((block) => {
    Array.from(block.children).forEach((child, i) => (child as HTMLElement).style.setProperty('--child-i', String(i)));
  });

  // Numbers start at zero, then count up when they come into view.
  counters.forEach((el) => {
    const p = parse(el.dataset.count ?? '');
    if (p) el.textContent = format(0, p);
  });

  const reveal = (el: HTMLElement, order: number) => {
    if (el.classList.contains('is-in')) return;
    el.style.setProperty('--reveal-i', String(order));
    el.classList.add('is-in');
    observer.unobserve(el);
    const nested = el.matches('[data-count]') ? [el] : Array.from(el.querySelectorAll<HTMLElement>('[data-count]'));
    nested.forEach(countUp);
    const parts = el.dataset.reveal === 'stagger' ? el.children.length : 1;
    settle(el, (order + parts) * STEP_MS + SETTLE_MS);
  };

  // Fire only once the element's top is a quarter of the way up the screen,
  // so it animates where you are actually looking.
  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((entry, i) => reveal(entry.target as HTMLElement, Math.min(i, 4)));
    },
    { rootMargin: '0px 0px -25% 0px', threshold: 0 },
  );
  items.forEach((el) => observer.observe(el));

  // At the very bottom of the page, nothing can rise any further: show what's left on screen.
  const onScroll = () => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (!atBottom) return;
    let order = 0;
    document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) reveal(el, Math.min(order++, 4));
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  cleanups.push(() => {
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
  });
}

/* ---------- Big images: scroll-linked zoom and parallax ---------- */

function initParallax() {
  if (!motionOn()) return;
  const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax], [data-zoom]'));
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

      if (el.hasAttribute('data-parallax')) {
        // -1 when the frame enters at the bottom, +1 as it leaves at the top
        const progress = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
        const range = Math.min(30, r.height * 0.05);
        el.style.setProperty('--py', `${(progress * range).toFixed(1)}px`);
      }

      if (el.hasAttribute('data-zoom')) {
        // Grows from 92% to full size as its top travels from the bottom
        // of the screen to the upper third; reverses when scrolling back.
        const t = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.7)));
        const eased = 1 - Math.pow(1 - t, 3);
        el.style.setProperty('--zoom', (0.92 + 0.08 * eased).toFixed(4));
        // First position eases in smoothly; after that it follows the scroll exactly.
        if (!el.hasAttribute('data-zoom-live') && !el.dataset.zoomPending) {
          el.dataset.zoomPending = '1';
          window.setTimeout(() => el.setAttribute('data-zoom-live', ''), 1000);
        }
      }
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

/* ---------- Navigation ----------
   The menu bar stays on screen at all times, so visitors never have to
   scroll back up to find it. */

function initNav() {
  root.removeAttribute('data-nav-hidden');
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

/* ---------- Instant feedback on navigation ----------
   If the next page takes a moment, a thin bar appears at the top
   (after 120ms, so fast navigations don't flash it). */
let loadingTimer: number | undefined;
document.addEventListener('astro:before-preparation', () => {
  window.clearTimeout(loadingTimer);
  loadingTimer = window.setTimeout(() => document.documentElement.setAttribute('data-loading', ''), 120);
});
document.addEventListener('astro:after-swap', () => {
  window.clearTimeout(loadingTimer);
  document.documentElement.removeAttribute('data-loading');
});
