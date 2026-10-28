/**
 * Site-wide settings. This is the one file to edit for things that
 * change often: availability, reply time, links.
 */
export const site = {
  name: 'Juan Posada',
  url: 'https://juanposada.co.uk',
  description:
    'Juan Posada is a London-based designer working across product, UX/UI, branding and print, creating work people understand, use and remember.',
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
   * 'dark'   = always start in dark mode (the main look).
   * 'system' = follow the visitor's device setting.
   * A visitor's own choice from the toggle is always remembered.
   */
  defaultTheme: 'dark' as 'dark' | 'system',
};

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Photography', href: '/photography' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
