/**
 * Site-wide settings. This is the one file to edit for things that
 * change often: availability, reply time, links.
 */
export const site = {
  name: 'Juan Posada',
  url: 'https://juanposada.co.uk',
  description:
    'Juan Posada is a London-based product designer working across UX/UI, branding and print, creating work people understand, use and remember.',
  /** What you do, in a few words: used in the Home page title and for search engines. */
  role: 'Product Designer',
  location: 'London, UK',

  /**
   * The small status line in the hero, contact page and CTA block.
   * mode 'rolling' → always shows a start date `leadDays` ahead, moved
   *                  to the following Monday ("…from Monday 10 November").
   *                  Set leadDays to your real lead time.
   * mode 'fixed'   → shows `fixedText` exactly (use when you're booked up).
   * mode 'hidden'  → hides the line everywhere.
   */
  availability: {
    mode: 'rolling' as 'rolling' | 'fixed' | 'hidden',
    prefix: 'Taking on new projects from',
    leadDays: 14,
    fixedText: 'Booked until [Month] · happy to chat about later projects',
  },
  replyTime: '2 working days',

  /** Used only by the "Copy email" button; never printed in the page. */
  email: 'hello@juanposada.co.uk',

  /** Leave empty to hide the "Book an intro call" link. */
  bookingUrl: '',

  /** Leave an href empty to hide that link. */
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/posadajuan/' },
    { label: 'Behance', href: 'https://www.behance.net/posadajuan' },
    { label: 'Instagram', href: 'https://www.instagram.com/juan_studiodesign/' },
  ],

  /**
   * Theme for first-time visitors.
   * 'system' = follow the visitor's device setting, live (light if the device
   *            doesn't say: light text-on-dark reads less well for most people
   *            in normal lighting).
   * 'dark' / 'light' = always start in that mode.
   * Picking a mode with the toggle is remembered; picking the one the device
   * already uses goes back to following the device.
   */
  defaultTheme: 'system' as 'system' | 'dark' | 'light',
  /**
   * Cloudflare Web Analytics (privacy-friendly visit counts, no cookies).
   * The token is public: it appears in every page. Leave empty to turn it off.
   */
  cfAnalyticsToken: 'e327df8506be4621ac25bca9f5680f95',
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
