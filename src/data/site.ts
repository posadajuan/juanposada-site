/**
 * Site-wide settings. This is the one file to edit for things that
 * change often: availability, reply time, links.
 */
export const site = {
  name: 'Juan Posada',
  url: 'https://juanposada.co.uk',
  description:
    'Juan Posada turns complex ideas into clear, playful digital experiences, from first sketch to launch.',
  location: '[City], UK',

  /** The small status line in the hero, contact page and CTA block. */
  availability: {
    show: true,
    text: 'Taking on projects from [Month Year]',
  },
  replyTime: '2 working days',

  /** Used only by the "Copy email" button; never printed in the page. */
  email: 'hello@juanposada.co.uk',

  /** Leave empty to hide the "Book an intro call" link. */
  bookingUrl: '',

  /** Leave an href empty to hide that link. */
  socials: [
    { label: 'LinkedIn', href: '' },
    { label: 'Behance', href: '' },
    { label: 'Instagram', href: '' },
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
