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
  /* The wall of work under the hero builds itself from your projects and logos
     (src/components/WorkWall.astro). The 'Sketch to launch' animation is kept in
     src/components/SketchToLaunch.astro if you want to swap it back in. */
  highlights: [
    { value: '60,000+', label: 'students signed up to Cyber Explorers' },
    { value: '2,500', label: 'schools across the UK using it' },
    { value: '20+', label: 'digital learning products designed at QA' },
    { value: '10+', label: 'years across digital learning, agencies, film/TV and corporate' },
  ],

  howIWork: {
    title: 'I think it through, test it early and design it with care.',
    /** icon: understand · concept · design · launch (see src/components/StepIcon.astro) */
    steps: [
      {
        icon: 'understand' as const,
        title: 'Understand',
        text: 'I start with the people and the goal: who it’s for, what they need, and what success looks like.',
      },
      {
        icon: 'concept' as const,
        title: 'Concept',
        text: 'I sketch a few ideas, share them early and test the strongest ones before anything gets built.',
      },
      {
        icon: 'design' as const,
        title: 'Design',
        text: 'I design the flows, screens and visuals, then test and refine them with the team until they feel obvious.',
      },
      {
        icon: 'launch' as const,
        title: 'Launch',
        text: 'I stay with the project through launch, and leave clear guidelines so the team can keep going.',
      },
    ],
  },

  hello: {
    title: 'Hi, I’m Juan. I like making complex things simple.',
    text: 'I’m a Colombian designer based in London, with 10+ years across agencies, film/TV and digital learning. I do my best work with teams who care about the people they’re designing for.',
    image: homePortrait,
    alt: 'Juan Posada standing in front of a wall covered in colourful street art and posters',
  },
};

/* ---------------- Work ---------------- */
export const work = {
  intro: 'A selection of my work across UX/UI, digital learning, branding and print.',
};

/* ---------------- Photography ---------------- */
export const photography = {
  intro: 'Photography is my hobby and an ongoing learning journey: mostly travel and wildlife, exploring how light, patience and timing shape a picture.',
};

/* ---------------- About ---------------- */
export const about = {
  hook: 'I design visual solutions that communicate clearly, strengthen brands and help people get things done.',
  intro:
    'I’m a product-minded designer with 10+ years across digital learning, agencies, film/TV and corporate teams. My strengths are conceptual thinking, fast execution and precision, and I love leading creative direction from first idea to launch.',
  portrait: aboutPortrait,
  portraitAlt: 'Juan Posada standing in front of a wall covered in colourful street art and posters',

  story: {
    title: 'From graphic design to products people use every day.',
    paragraphs: [
      'I studied Graphic Design, Animation and Multimedia in Colombia and started out on BMW and Citroën campaigns, then designed packaging, events and campaigns in-house for Gyplac. In 2014 I co-founded SIETE17 Estudio Visual, leading brand and design work for more than 15 clients, before redesigning the brand of 11:11 Films & TV and creating key visuals for film and TV projects pitched to Netflix and Fox.',
      'Since 2019 I’ve been at QA in the UK, where I’ve led concept, UI and creative direction for more than 20 digital learning products, including Cyber Explorers for the UK government, working alongside learning designers, developers, animators and video producers.',
      'Today I combine UX/UI, visual design and motion with AI-assisted workflows, so I can move faster without losing quality. I’m certified in UX design by the UX Design Institute and as a ScrumMaster.',
    ],
  },

  principles: [
    { title: 'Clarity first', text: 'If people have to work out the interface, it’s in the way. I strip things back until the next step feels obvious.' },
    { title: 'Engagement with purpose', text: 'Characters, motion and storytelling keep people engaged, as long as every detail helps them understand or remember.' },
    { title: 'Whole team, one story', text: 'Good products come from clients, designers, developers and animators pulling in one direction. Design keeps everyone telling the same story.' },
  ],

  /** Newest first. */
  experience: [
    { years: '2019 – Now', role: 'Senior Graphic Designer', company: 'QA Ltd', sector: 'Digital learning' },
    { years: '2015 – 2017', role: 'Brand & Marketing Designer', company: '11:11 Films & TV', sector: 'Film / TV' },
    { years: '2014 – 2015', role: 'Co-Founder & Creative Director', company: 'SIETE17 Estudio Visual', sector: 'Studio' },
    { years: '2012 – 2014', role: 'Marketing & Graphic Designer', company: 'Etex Group (Gyplac)', sector: 'Corporate' },
    { years: '2010 – 2011', role: 'Graphic Designer', company: 'XPO', sector: 'Automotive marketing' },
  ],

  recognition: [
    { title: 'Cyber Explorers (UK government)', detail: '60,000+ students in 2,500 schools, GOV.UK, 2023' },
  ],

  certifications: [
    'Designing AI-Powered Products, QA (2026)',
    'Certificate in Business Service Design, A4Q (2026)',
    'Professional Certificate in UX Design, UX Design Institute (2024)',
    'Certified ScrumMaster, Scrum Alliance (2021)',
    'Generative AI: Intermediate Prompting, QA (2024)',
  ],

  offScreen: {
    title: 'Away from the screen',
    text: 'Away from the screen I play the drums, take photos and go mountain biking, usually with my dog trying to keep up. I’m also into art, music and anything with four-wheel drive.',
    /** Leave empty to hide the link. */
    youtube: 'https://www.youtube.com/@onerider8285',
    image: offScreen,
    alt: 'Juan mountain biking in a red checked shirt along a forest track, his dog running alongside',
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
  highlight: 'people remember.',
  text: 'Tell me about your project, team or role.',
  topics: ['Product', 'Brand', 'Web', 'Other'],
};

/* ---------------- Calls to action (the dark block at the end of each page) ----------------
   Each page ends with one that fits what the visitor just saw.
   before + highlight (gradient) + after form the heading; "{reply}" becomes the reply time. */
export const ctas = {
  home: { before: 'Got a complex idea that needs to feel', highlight: 'simple?', after: '', text: 'Tell me where you’re stuck. I reply within {reply}.' },
  work: { before: 'Want work like this for your', highlight: 'product?', after: '', text: 'Share a few lines about your project or role. I reply within {reply}.' },
  learning: { before: 'Want learners to actually', highlight: 'enjoy it?', after: '', text: 'Tell me about your course or platform. I reply within {reply}.' },
  brand: { before: 'Need a brand that works', highlight: 'everywhere?', after: '', text: 'Tell me about your brand and where it needs to show up. I reply within {reply}.' },
  characters: { before: 'Need characters that', highlight: 'speak to everyone?', after: '', text: 'Tell me about your audience and your story. I reply within {reply}.' },
  logos: { before: 'Need a mark that works', highlight: 'everywhere?', after: '', text: 'Tell me about your brand. I reply within {reply}.' },
  graphicDesign: { before: 'Got a brand, pack or print piece to', highlight: 'bring to life?', after: '', text: 'Tell me what you’re making. I reply within {reply}.' },
  photography: { before: 'Like the way I see things? Let’s make something', highlight: 'together.', after: '', text: 'Tell me a little about your project. I reply within {reply}.' },
  about: { before: 'Sounds like a', highlight: 'good fit?', after: '', text: 'Tell me about your project, team or role. I reply within {reply}.' },
};
