---
# ─────────────────────────────────────────────────────────────
# NEW CASE STUDY TEMPLATE
# 1. Copy this whole "_template" folder.
# 2. Rename the copy to the project's web address, lowercase with
#    dashes, e.g. "museum-app" → juanposada.co.uk/work/museum-app
#    (no underscore at the start, or it stays hidden).
# 3. Replace the images in the folder with your own (same names, or
#    change the file names below to match).
# 4. Fill in every field. Text in quotes can contain anything.
#    ">" lets a long paragraph continue on the next lines.
# Aim for a 3–5 minute read: short text, strong images.
# ─────────────────────────────────────────────────────────────

title: Project name
outcome: One sentence on what changed because of the work.   # max 160 characters
tags: [Product, Branding]        # 1–3 short tags
year: 2025
order: 10                        # lower numbers show first on the Work page
featured: false                  # true = show on the Home page (max 4 projects)
draft: true                      # true = hidden while you work on it
private: false                   # true = NDA: locked card, no case study page

cover: ./cover.jpg               # card + top of the case study (landscape)
coverAlt: Describe the cover image for people who can't see it

snapshot:                        # the recruiter-friendly summary card
  role: Lead product designer
  team: Product, engineering, animation
  timeline: Jan 2025 – Jun 2025
  tools: [Figma, Miro]
  impact: The headline result in a few words

problem:
  headline: The problem as a headline someone could repeat
  text: >
    Two or three sentences: who had the problem, why it mattered
    and what constraints you were working with.
  image: ./problem.jpg           # optional: delete both image lines if not needed
  imageAlt: What the image shows

research:
  headline: What you learned that changed the direction
  text: >
    One short paragraph on how you found out: interviews, workshops,
    testing, data.
  insights:                      # up to 3 short findings, shown as cards
    - Short finding one
    - Short finding two
    - Short finding three
  quote:                         # optional: delete these 3 lines if you have no quote
    text: A real quote that captures the insight.
    by: Name, role

solution:
  headline: The idea in one sentence
  decisions:                     # 2–3 works best, image + why
    - title: Decision one
      text: Why you made it, in two lines.
      image: ./decision-1.jpg
      imageAlt: What this screen shows
    - title: Decision two
      text: Why you made it, in two lines.
      image: ./decision-2.jpg
      imageAlt: What this screen shows
      wide: true                 # optional: image full width, text below (automatic for images about 2:1 or wider)
  showcase: ./showcase.jpg       # optional big full-width image
  showcaseAlt: What the showcase shows
  details:                       # optional pair of images (one on its own shows full width)
    - image: ./detail-1.jpg
      imageAlt: Detail one
    - image: ./detail-2.jpg
      imageAlt: Detail two

impact:
  headline: What changed
  stats:                         # up to 3 big numbers
    - value: 40%
      label: faster onboarding
    - value: 12K
      label: monthly users

reflection: >
  One honest paragraph: what you learned, what you would do
  differently and what you are proud of.
---
