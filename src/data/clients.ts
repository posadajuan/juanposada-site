/**
 * Brands Juan has worked with, shown as one moving line of logos under the
 * Home headline (src/components/LogoMarquee.astro).
 *
 * Each logo is a one-colour SVG in public/clients/. The site colours it
 * (white in dark mode, black in light mode), so the file's own colours
 * don't matter, as long as the logo is dark on a transparent or white background.
 *
 * To add a brand: put its SVG in public/clients/ and add a line below.
 * ratio = width ÷ height of the SVG's viewBox (it keeps the logos optically
 * balanced: wide wordmarks sit lower, square marks a little taller).
 * Order here = order on the page.
 */
export const clients = [
  { name: 'HSBC', file: '/clients/hsbc.svg', ratio: 3.72 },
  { name: 'Fujitsu', file: '/clients/fujitsu.svg', ratio: 2.05 },
  { name: 'NatWest', file: '/clients/natwest.svg', ratio: 4.76 },
  { name: "Lloyd's Register", file: '/clients/lloyds-register.svg', ratio: 0.88 },
  { name: 'Legal & General', file: '/clients/legal-and-general.svg', ratio: 2.41 },
  { name: 'Clyde & Co', file: '/clients/clyde-and-co.svg', ratio: 5.39 },
  { name: 'Department for Digital, Culture, Media & Sport', file: '/clients/dcms.svg', ratio: 1.42 },
  { name: 'National Highways', file: '/clients/national-highways.svg', ratio: 3.42 },
  { name: 'Environment Agency', file: '/clients/environment-agency.svg', ratio: 3.62 },
  { name: 'British Council', file: '/clients/british-council.svg', ratio: 3.45 },
  { name: 'QA', file: '/clients/qa.svg', ratio: 3.05 },
  { name: 'Cloud Academy', file: '/clients/cloud-academy.svg', ratio: 0.92 },
  { name: 'BMW', file: '/clients/bmw.svg', ratio: 1.0 },
  { name: 'Citroën', file: '/clients/citroen.svg', ratio: 1.03 },
  { name: 'Etex', file: '/clients/etex.svg', ratio: 3.19 },
];
