/**
 * The words on Home, Work, Photography, About and Contact.
 *
 * Edit text here; the layouts pick it up automatically.
 * Text in [brackets] is a placeholder waiting for your copy.
 * To swap a photo, replace the image file in src/assets/ (same name).
 */
import homePortrait from '@/assets/home/portrait.jpg';
import aboutPortrait from '@/assets/about/portrait.jpg';
import offScreen from '@/assets/about/off-screen.jpg';

/* ---------------- Home ---------------- */
export const home = {
  /* The animation under the hero lives in src/components/SketchToLaunch.astro. */
  highlights: [
    { value: '50,000+', label: 'students reached with Cyber Explorers' },
    { value: '2,500+', label: 'schools across the UK' },
    { value: '10+', label: 'years across learning, agencies, film/TV and corporate' },
    { value: '[Award]', label: '[Award name and year]' },
  ],

  howIWork: {
    title: 'From first idea to launch, with the whole team in the room.',
    steps: [
      { title: 'Concept', text: '[How you frame the problem and find the idea worth building.]' },
      { title: 'UX & UI', text: '[How you research, prototype and test until it feels obvious.]' },
      { title: 'Creative direction', text: '[How you lead animation, video and engineering to a shipped result.]' },
    ],
  },

  hello: {
    title: '[A short, human intro in two lines.]',
    text: '[Where you’re based, what you care about, and the kind of teams you love working with.]',
    image: homePortrait,
    alt: 'Portrait of Juan Posada',
  },
};

/* ---------------- Work ---------------- */
export const work = {
  intro: '[One line framing the work: products, learning experiences and brands, from first sketch to launch.]',
};

/* ---------------- Photography ---------------- */
export const photography = {
  intro: '[One line: what you shoot and why. Personal work, for the love of it.]',
};

/* ---------------- About ---------------- */
export const about = {
  hook: '[A one-line human hook about how you see design.]',
  intro:
    'I’m a product-minded designer with 10+ years across digital learning, agencies, film/TV and corporate teams. [One more line on what drives you.]',
  portrait: aboutPortrait,
  portraitAlt: 'Portrait of Juan Posada',

  story: {
    title: 'From graphic design to products people use every day.',
    paragraphs: [
      '[Where you started: graphic design, Colombia to the UK, the jump into product.]',
      '[What you do now: leading concept, UX/UI and creative direction from first idea to launch, with product, animation, video and engineering teams.]',
      '[How you work today: AI-assisted workflows to move faster without losing quality.]',
    ],
  },

  principles: [
    { title: 'Clarity first', text: '[Short principle.]' },
    { title: 'Play with purpose', text: '[Short principle.]' },
    { title: 'Whole team, one story', text: '[Short principle.]' },
  ],

  /** Newest first. */
  experience: [
    { years: '[YYYY – Now]', role: '[Role]', company: '[Company]', sector: 'Digital learning' },
    { years: '[YYYY – YYYY]', role: '[Role]', company: '[Company]', sector: 'Agency' },
    { years: '[YYYY – YYYY]', role: '[Role]', company: '[Company]', sector: 'Film / TV' },
    { years: '[YYYY – YYYY]', role: '[Role]', company: '[Company]', sector: 'Corporate' },
  ],

  recognition: [
    { title: 'Cyber Explorers (DCMS)', detail: '[Award, year]' },
  ],

  certifications: ['UX Design Institute', 'Certified ScrumMaster'],

  offScreen: {
    title: 'Away from the screen',
    text: '[Drums, photography, mountain biking, art and music: a couple of lines that make you memorable.]',
    image: offScreen,
    alt: '[Describe the photo]',
  },

  /**
   * Put your CV PDF in the "public" folder and write its file name here,
   * e.g. '/juan-posada-cv.pdf'. Leave empty to hide the link.
   */
  cv: { file: '', size: '' },
};

/* ---------------- Contact ---------------- */
export const contact = {
  title: 'Let’s make something',
  highlight: 'clear and playful.',
  text: 'Tell me about your project, team or role.',
  topics: ['Product', 'Brand', 'Web', 'Other'],
};
